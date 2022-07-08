export default function Card({
  title,
  className,
  children,
  titleClassName,
  divider = true,
  btn,
  ...props
}) {
  let titleContent = "";
  if (title) {
    titleContent = (
      <>
        {btn}
        <div
          className={
            "font-medium text-xl mt-6 mb-6 flex justify-between " +
            titleClassName
          }
        >
          {title}
        </div>
        {divider ? <hr /> : ""}
      </>
    );
  }

  return (
    <div
      className={`bg-dark-blue shadow-lg pt-3 px-6 pb-6 rounded-lg ${
        className ?? ""
      }`}
    >
      {titleContent}
      {children}
    </div>
  );
}
