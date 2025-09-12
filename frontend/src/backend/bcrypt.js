import bcrypt from "bcrypt";

async function generateHash(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log("Hashed Password:", hashedPassword);
  return hashedPassword;
}

// Ganti 'secret' dengan password yang ingin kamu gunakan
generateHash("secret").then((hash) => {
  // Salin hash ini dan gunakan di query INSERT kamu
  console.log(hash);
});
