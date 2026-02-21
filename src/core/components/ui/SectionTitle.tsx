export const SectionTitle = ({ title }: { title: string }) => (
  <div className="bg-gray-200 font-bold px-2 py-1 border-y border-black">
    {title}
  </div>
);

export const TableRow = ({
  n,
  label,
  value,
}: {
  n: string;
  label: string;
  value: string;
}) => (
  <div className="flex border-b border-black">
    <div className="w-[20px] text-center border-r border-black font-bold">
      {n}
    </div>
    <div className="flex-1 px-2">{label}</div>
    <div className="w-[120px] text-right border-l border-black font-mono font-bold px-2">
      {value}
    </div>
  </div>
);

export const Field = ({
  label,
  value,
  width,
  flex,
}: {
  label: string;
  value: string;
  width?: string;
  flex?: boolean;
}) => (
  <div
    className={`border-r border-black p-1 ${flex ? "flex-1" : ""}`}
    style={{ width }}
  >
    <span className="block text-[6pt] uppercase">{label}</span>
    <span className="font-bold block">{value}</span>
  </div>
);
