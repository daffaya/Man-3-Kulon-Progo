import React from "react";
import Layout from "../components/layout/Layout";
import { Link } from "react-router-dom";
import { Mail, Github, Twitter, Linkedin } from "lucide-react";

const ProfilePage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Daffa Pasya
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            A Bear, Professional Bullshitter, Creative Enthusiast
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
          <div className="md:w-1/3">
            <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
              <img
                src="/profile.jpg"
                alt="Daffa"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3">Connect with me</h3>
              <div className="flex space-x-4">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-semibackground rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-semibackground rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-semibackground rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a
                  href="mailto:example@example.com"
                  className="p-2 bg-gray-100 dark:bg-semibackground rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Email"
                >
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="prose dark:prose-invert max-w-none">
              <p>
                Most people expect loud voices when it comes to hot topics. He
                prefers quiet moments—those where a sentence or idea lingers a
                bit longer, where something clicks and sticks.
              </p>

              <p>
                But stick around a little longer, and you`ll realize—he`s that
                one friend who explains everything to you without sounding like
                your mom.
              </p>

              <p>
                He writes like he`s texting a close friend—relatable, honest,
                and sometimes sneakily deep. He doesn`t claim to have it all
                figured out. Heck, he`s still learning, still tweaking his life.
                But if there`s one thing he knows, it`s this:
                <blockquote>
                  The journey of learning and growing is way more interesting
                  when we do it together.
                </blockquote>
              </p>

              <p>
                If he goes quiet on Instagram, don`t worry. He`s probably
                scribbling new ideas, watching way too many Islamic lectures, or
                just staring at the ceiling thinking,{" "}
                <i> “Hari ini aku ngapain aja ya?” </i>
              </p>

              <p>
                Oh, and just so you know—he`s still figuring things out too.
                <br />
                <i>
                  Tapi katanya, belajar bareng-bareng itu lebih menyenangkan.
                </i>
              </p>

              <p>
                Thank you for taking the time to stare at him like a weirdo. If
                you`re interested in collaborating or just want to say hello,
                feel free to reach out through my{" "}
                <Link
                  to="/contact"
                  className="text-accent hover:text-accent/80"
                >
                  contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <section className="py-10 bg-gray-50 dark:bg-semibackground rounded-xl px-8 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">
            Want to work together?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            I`m always open to interesting collaborations, speaking
            opportunities, and consulting projects.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Get in Touch
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default ProfilePage;
