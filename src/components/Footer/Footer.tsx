const Footer = () => {
  return (
    <footer className="sticky bottom-0 bg-gray-800 p-4 text-center text-white">
      <p>&copy; {new Date().getFullYear()} Chess App. All rights reserved.</p>
    </footer>
  );
};

export { Footer };
