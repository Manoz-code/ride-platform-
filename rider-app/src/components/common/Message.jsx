function Message({ children }) {
  if (!children) {
    return null;
  }

  return (
    <div className="message">
      {children}
    </div>
  );
}

export default Message;
