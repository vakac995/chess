const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center sticky bottom-0">
      <p>&copy; {new Date().getFullYear()} Chess App. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
