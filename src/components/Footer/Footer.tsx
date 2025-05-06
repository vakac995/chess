const Footer = () => {
  return (
    <footer className="bg-secondary sticky bottom-0 p-4 text-center text-white">
      <p>&copy; {new Date().getFullYear()} Chess App. All rights reserved.</p>
    </footer>
  );
};

export { Footer };
