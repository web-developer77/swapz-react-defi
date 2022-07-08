export default function BottomNavFooterLink({ href, labelText, icon }) {
  return (
    <div>
      <a href={href} target="_blank">
        <div className="flex px-4 pt-1.5 pb-1.5 rounded-md hover:bg-gray-100 group">
          <div className="inline-block self-center">{icon}</div>
          <div className="inline-block pl-2 self-center ">{labelText}</div>
        </div>
      </a>
    </div>
  );
}
