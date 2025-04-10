const Footer = () => {
  return (
    <footer className="py-8 bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
        <p>&copy; 2025 DreamDay. All rights reserved.</p>
        <div className="mt-4 sm:mt-0 flex gap-6">
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white">
            Terms of Service
          </a>
          <a href="#" className="hover:text-white">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
