// PERF P0-3: uploaded article/CMS images must be resized + recompressed
// server-side without breaking format, transparency, orientation or animation.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import express from "express";
import sharp from "sharp";

const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "p03-"));
process.env.UPLOADS_DIR = path.join(tmpRoot, "uploads"); // must be set before importing the modules below

const { default: ImageProcessingService } = await import(
  "../src/services/imageProcessingServices.js"
);
const { imageUpload, contentImageUpload } = await import(
  "../src/services/fileUploadService.js"
);
const { default: cmsUpload } = await import("../src/middleware/cmsUpload.js");

const processor = new ImageProcessingService();

/** Noisy image so it is genuinely large (compresses poorly), like a camera photo. */
const noisy = (width, height, channels = 3) => {
  const raw = Buffer.alloc(width * height * channels);
  for (let i = 0; i < raw.length; i++) raw[i] = (i * 2654435761) % 251;
  return sharp(raw, { raw: { width, height, channels } });
};

/** Smooth gradient + mild noise (photo/screenshot-like) so PNG resize genuinely shrinks it. */
const photoLike = (width, height, channels = 4) => {
  const raw = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      raw[o] = (x / width) * 255;
      raw[o + 1] = (y / height) * 255;
      raw[o + 2] = ((x + y) / (width + height)) * 255 + ((x * y) % 7);
      if (channels === 4) raw[o + 3] = 255;
    }
  }
  return sharp(raw, { raw: { width, height, channels } });
};

const write = async (name, pipeline) => {
  const file = path.join(tmpRoot, name);
  await pipeline.toFile(file);
  return file;
};

// ---------- unit: ImageProcessingService.optimizeInPlace ----------

test("large JPEG is shrunk to <=1920px and gets smaller, stays JPEG", async () => {
  const file = await write("big.jpg", noisy(4000, 3000).jpeg({ quality: 95 }));
  const before = (await fs.stat(file)).size;

  const result = await processor.optimizeInPlace(file);
  const meta = await sharp(file).metadata();

  assert.equal(result.optimized, true);
  assert.equal(meta.format, "jpeg");
  assert.ok(Math.max(meta.width, meta.height) <= 1920);
  assert.equal(meta.width, 1920); // aspect ratio kept: 4000x3000 -> 1920x1440
  assert.equal(meta.height, 1440);
  assert.ok((await fs.stat(file)).size < before);
  await assert.rejects(fs.stat(`${file}.optimizing`)); // temp file cleaned up
});

test("EXIF orientation is applied (phone photos don't end up sideways)", async () => {
  // 200x100 pixels stored with orientation=6 (rotate 90deg) => displays as 100x200
  const file = await write(
    "rot.jpg",
    noisy(2400, 1200).withMetadata({ orientation: 6 }).jpeg({ quality: 95 }),
  );
  await processor.optimizeInPlace(file);
  const meta = await sharp(file).metadata();

  assert.ok(meta.height > meta.width, "should now be portrait");
  assert.notEqual(meta.orientation, 6);
});

test("PNG keeps format and alpha channel (transparent logos)", async () => {
  const file = await write("logo.png", photoLike(3000, 3000).png());
  const result = await processor.optimizeInPlace(file);
  const meta = await sharp(file).metadata();

  assert.equal(result.optimized, true);
  assert.equal(meta.format, "png");
  assert.equal(meta.hasAlpha, true);
  assert.ok(meta.width <= 1920);
});

test("small image is never enlarged", async () => {
  const file = await write("small.png", noisy(300, 200, 4).png());
  await processor.optimizeInPlace(file);
  const meta = await sharp(file).metadata();
  assert.equal(meta.width, 300);
  assert.equal(meta.height, 200);
});

test("file is left byte-identical when the result would not be smaller", async () => {
  const file = await write("tiny.png", sharp({
    create: { width: 8, height: 8, channels: 3, background: "#123456" },
  }).png({ compressionLevel: 9 }));
  const original = await fs.readFile(file);

  const result = await processor.optimizeInPlace(file);

  assert.equal(result.optimized, false);
  assert.deepEqual(await fs.readFile(file), original);
  await assert.rejects(fs.stat(`${file}.optimizing`));
});

test("animated GIF is skipped untouched", async () => {
  const frames = Buffer.concat([
    await noisy(64, 64).raw().toBuffer(),
    await noisy(64, 64).negate().raw().toBuffer(),
  ]);
  const gif = await sharp(frames, {
    raw: { width: 64, height: 128, channels: 3, pageHeight: 64 },
  }).gif({ loop: 0, delay: [100, 100] }).toBuffer();
  const file = path.join(tmpRoot, "anim.gif");
  await fs.writeFile(file, gif);

  const result = await processor.optimizeInPlace(file);

  assert.equal(result.optimized, false);
  assert.deepEqual(await fs.readFile(file), gif);
});

test("corrupt file rejects, original stays, no temp file left behind", async () => {
  const file = path.join(tmpRoot, "corrupt.jpg");
  await fs.writeFile(file, Buffer.from("this is not an image"));

  await assert.rejects(processor.optimizeInPlace(file));
  assert.equal((await fs.readFile(file)).toString(), "this is not an image");
  await assert.rejects(fs.stat(`${file}.optimizing`));
});

// ---------- integration: real multer middlewares over HTTP ----------

let server;
let baseUrl;

before(async () => {
  const app = express();
  app.post("/cover", imageUpload, (req, res) => res.json({ file: req.file }));
  app.post("/content", contentImageUpload, (req, res) => res.json({ file: req.file }));
  app.post("/cms", cmsUpload, (req, res) => res.json({ file: req.file }));
  // same shape as server.js error handler: forwarded multer errors -> 500
  app.use((err, req, res, next) => res.status(500).json({ error: err.message }));
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

const post = async (route, field, buffer, filename, type, extra = {}) => {
  const form = new FormData();
  for (const [k, v] of Object.entries(extra)) form.append(k, v); // text fields BEFORE file (cover filename uses req.body.title)
  form.append(field, new Blob([buffer], { type }), filename);
  const res = await fetch(`${baseUrl}${route}`, { method: "POST", body: form });
  return { status: res.status, body: await res.json() };
};

test("cover upload is resized on disk; filename unchanged", async () => {
  const big = await noisy(4000, 3000).jpeg({ quality: 95 }).toBuffer();
  const { status, body } = await post("/cover", "coverImageFile", big, "foto.jpg", "image/jpeg", {
    title: "Juara Lomba Sains",
  });

  assert.equal(status, 200);
  assert.equal(body.file.filename, "man3kulonprogo-juara_lomba_sains.jpg");
  const saved = path.join(process.env.UPLOADS_DIR, "covers", body.file.filename);
  const meta = await sharp(saved).metadata();
  assert.ok(meta.width <= 1920);
  assert.ok((await fs.stat(saved)).size < big.length);
});

test("article content image is resized on disk", async () => {
  const big = await noisy(3500, 2500).jpeg({ quality: 95 }).toBuffer();
  const { status, body } = await post("/content", "image", big, "x.jpg", "image/jpeg");

  assert.equal(status, 200);
  const meta = await sharp(body.file.path).metadata();
  assert.ok(Math.max(meta.width, meta.height) <= 1920);
});

test("CMS upload is resized and keeps PNG transparency", async () => {
  const big = await photoLike(3000, 3000).png().toBuffer();
  const { status, body } = await post("/cms", "image", big, "logo-mitra.png", "image/png");

  assert.equal(status, 200);
  assert.ok(body.file.filename.endsWith(".png"));
  const meta = await sharp(body.file.path).metadata();
  assert.equal(meta.hasAlpha, true);
  assert.ok(meta.width <= 1920);
});

test("upload still succeeds (fails open) when the bytes are not a real image", async () => {
  const { status, body } = await post(
    "/content", "image", Buffer.from("not really a jpeg"), "fake.jpg", "image/jpeg",
  );
  assert.equal(status, 200);
  assert.equal((await fs.readFile(body.file.path)).toString(), "not really a jpeg");
});

test("CMS middleware still forwards multer errors (wrong type -> 500 via error handler)", async () => {
  const { status } = await post("/cms", "image", Buffer.from("hello"), "a.txt", "text/plain");
  assert.equal(status, 500);
});
