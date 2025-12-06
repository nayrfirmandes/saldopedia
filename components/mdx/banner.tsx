type PostBannerProps = {
  title: string;
  children: React.ReactNode;
};

export default function PostBanner({ title, ...props }: PostBannerProps) {
  return (
    <div className="relative rounded-2xl bg-white p-5 shadow-lg shadow-black/[0.03] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] dark:bg-gray-800 dark:shadow-black/20 dark:before:[background:linear-gradient(var(--color-gray-700),var(--color-gray-800))_border-box]">
      <div className="mb-2 flex items-center">
        <svg
          className="mr-3 shrink-0 fill-blue-500 dark:fill-blue-400"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1Zm1-3H7V4h2v5Z" />
        </svg>
        <div className="font-medium dark:text-gray-100">{title}</div>
      </div>
      <div className="text-sm dark:text-gray-300">{props.children}</div>
    </div>
  );
}
