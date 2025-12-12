import Image, { StaticImageData } from "next/image";

export default function Testimonial({
  testimonial,
  cloned = false,
  className,
  children,
}: {
  testimonial: {
    img: StaticImageData | string;
    name: string;
    username?: string;
    date: string;
    rating?: number;
    videoUrl?: string;
    videoThumb?: StaticImageData | string;
    channel?: string;
    verified?: boolean;
  };
  cloned?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const channelIcon = (channel: string) => {
    const channelLower = channel.toLowerCase();
    switch (channelLower) {
      case "twitter":
        return (
          <svg
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="15"
            fill="none"
          >
            <path
              fillRule="evenodd"
              d="M16.928 14.054H11.99L8.125 9.162l-4.427 4.892H1.243L6.98 7.712.928.054H5.99L9.487 4.53 13.53.054h2.454l-5.358 5.932 6.303 8.068Zm-4.26-1.421h1.36L5.251 1.4H3.793l8.875 11.232Z"
            />
          </svg>
        );
      case "instagram":
        return (
          <svg
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
          >
            <path d="M8 0C5.827 0 5.555.01 4.702.048 3.85.088 3.27.222 2.76.42c-.526.204-.973.478-1.417.923C.898 1.787.624 2.234.42 2.76.222 3.27.087 3.85.048 4.7.01 5.555 0 5.827 0 8s.01 2.445.048 3.298c.04.852.174 1.433.372 1.942.204.526.478.973.923 1.417.444.445.89.72 1.417.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.445-.01 3.298-.048c.852-.04 1.433-.174 1.942-.372.526-.204.973-.478 1.417-.923.445-.444.72-.89.923-1.417.198-.51.333-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.298c-.04-.852-.174-1.433-.372-1.942-.204-.526-.478-.973-.923-1.417C14.213.898 13.766.624 13.24.42c-.51-.198-1.09-.333-1.942-.372C10.445.01 10.173 0 8 0zm0 1.44c2.136 0 2.39.01 3.233.048.78.036 1.203.166 1.485.276.374.145.64.318.92.598.28.28.453.546.598.92.11.282.24.705.276 1.485.038.844.047 1.097.047 3.233s-.01 2.39-.05 3.233c-.04.78-.17 1.203-.28 1.485-.15.374-.32.64-.6.92-.28.28-.55.453-.92.598-.28.11-.71.24-1.49.276-.85.038-1.1.047-3.24.047s-2.39-.01-3.24-.05c-.78-.04-1.21-.17-1.49-.28-.38-.15-.64-.32-.92-.6-.28-.28-.46-.55-.6-.92-.11-.28-.24-.71-.28-1.49-.03-.85-.04-1.1-.04-3.24s.01-2.39.04-3.24c.04-.78.17-1.21.28-1.49.14-.38.32-.64.6-.92.28-.28.54-.46.92-.6.28-.11.7-.24 1.49-.28.85-.03 1.1-.04 3.24-.04zm0 2.452c-2.27 0-4.108 1.84-4.108 4.108 0 2.27 1.84 4.108 4.108 4.108 2.27 0 4.108-1.84 4.108-4.108 0-2.27-1.84-4.108-4.108-4.108zM8 10.667c-1.473 0-2.667-1.194-2.667-2.667S6.527 5.333 8 5.333s2.667 1.194 2.667 2.667S9.473 10.667 8 10.667zm4.27-6.585c0 .53-.43.96-.96.96s-.96-.43-.96-.96.43-.96.96-.96.96.43.96.96z"/>
          </svg>
        );
      case "telegram":
        return (
          <svg
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
          >
            <path d="M14.85 2.85 12.7 13.1c-.15.7-.55.85-1.1.55l-3.05-2.25-1.45 1.4c-.15.15-.3.3-.65.3l.25-3.4 6.2-5.6c.25-.25-.05-.35-.4-.15l-7.65 4.8-3.3-1.05c-.7-.2-.7-.7.15-1.05l12.9-5c.6-.2 1.1.15.9 1.05Z"></path>
          </svg>
        );
      case "facebook":
        return (
          <svg
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
          >
            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
          </svg>
        );
      case "whatsapp":
        return (
          <svg
            className="fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
          </svg>
        );
      default:
        return "";
    }
  };

  const isBase64Image = typeof testimonial.img === 'string' && testimonial.img.startsWith('data:');

  return (
    <article
      className={`relative flex flex-col rounded-2xl bg-linear-to-br from-white/90 via-white/70 to-gray-50/80 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-900/80 p-5 shadow-lg shadow-black/[0.03] dark:shadow-black/[0.2] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] dark:before:[background:linear-gradient(rgb(55_65_81),rgb(75_85_99))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] ${className}`}
    >
      <header className="mb-4 flex items-center gap-3">
        {isBase64Image ? (
          <img
            className="shrink-0 rounded-full object-cover"
            src={testimonial.img as string}
            width={44}
            height={44}
            alt={testimonial.name}
            style={{ width: '44px', height: '44px' }}
          />
        ) : (
          <Image
            className="shrink-0 rounded-full object-cover"
            src={testimonial.img}
            width={44}
            height={44}
            alt={testimonial.name}
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold dark:text-gray-100">{testimonial.name}</span>
            {testimonial.verified && (
              <svg
                className="h-[18px] w-[18px] shrink-0 inline-block"
                viewBox="0 0 22 22"
                fill="none"
                aria-label="Verified"
              >
                <path
                  d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
                  fill="#1D9BF0"
                />
              </svg>
            )}
          </div>
          {testimonial.username ? (
            <div>
              <a
                className="text-sm font-medium text-gray-500/80 dark:text-gray-400/80 transition hover:text-gray-500 dark:hover:text-gray-300"
                href="#0"
                tabIndex={cloned ? -1 : 0}
              >
                {testimonial.username}
              </a>
            </div>
          ) : null}
        </div>
      </header>
      {testimonial.rating ? (
        <div className="mb-3 inline-flex">
          <span className="sr-only">Rating is {testimonial.rating} out of 5</span>
          <div className="relative">
            <svg
              className="fill-gray-200 dark:fill-gray-700"
              xmlns="http://www.w3.org/2000/svg"
              width={114}
              height={18}
            >
              <path d="m105 .44 2.782 5.636 6.218.903-4.5 4.386 1.062 6.195L105 14.635l-5.562 2.925 1.062-6.195L96 6.98l6.218-.903L105 .44ZM81 .44l2.782 5.636L90 6.979l-4.5 4.386 1.062 6.195L81 14.635l-5.562 2.925 1.062-6.195L72 6.98l6.218-.903L81 .44ZM57 .44l2.782 5.636L66 6.979l-4.5 4.386 1.062 6.195L57 14.635l-5.562 2.925 1.062-6.195L48 6.98l6.218-.903L57 .44ZM33 .44l2.782 5.636L42 6.979l-4.5 4.386 1.062 6.195L33 14.635l-5.562 2.925 1.062-6.195L24 6.98l6.218-.903L33 .44ZM9 .44l2.782 5.636L18 6.979l-4.5 4.386 1.062 6.195L9 14.635 3.438 17.56 4.5 11.365 0 6.98l6.218-.903L9 .44Z" />
            </svg>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${(testimonial.rating / 5) * 100}%` }}
            >
              <svg
                className="fill-amber-400"
                xmlns="http://www.w3.org/2000/svg"
                width={114}
                height={18}
              >
                <path d="m105 .44 2.782 5.636 6.218.903-4.5 4.386 1.062 6.195L105 14.635l-5.562 2.925 1.062-6.195L96 6.98l6.218-.903L105 .44ZM81 .44l2.782 5.636L90 6.979l-4.5 4.386 1.062 6.195L81 14.635l-5.562 2.925 1.062-6.195L72 6.98l6.218-.903L81 .44ZM57 .44l2.782 5.636L66 6.979l-4.5 4.386 1.062 6.195L57 14.635l-5.562 2.925 1.062-6.195L48 6.98l6.218-.903L57 .44ZM33 .44l2.782 5.636L42 6.979l-4.5 4.386 1.062 6.195L33 14.635l-5.562 2.925 1.062-6.195L24 6.98l6.218-.903L33 .44ZM9 .44l2.782 5.636L18 6.979l-4.5 4.386 1.062 6.195L9 14.635 3.438 17.56 4.5 11.365 0 6.98l6.218-.903L9 .44Z" />
              </svg>
            </div>
          </div>
        </div>
      ) : null}
      {testimonial.videoThumb ? (
        <div className="grow">
          <p className="mb-4 font-semibold">{children}</p>
          <a href={testimonial.videoUrl} tabIndex={cloned ? -1 : 0}>
            <Image
              className="w-full"
              src={testimonial.videoThumb}
              width={312}
              height={180}
              alt="View on YouTuobe"
            />
          </a>
        </div>
      ) : (
        <div className="grow text-sm text-gray-700 dark:text-gray-300">{children}</div>
      )}
      <footer className="mt-4 flex items-center gap-2.5 text-gray-700 dark:text-gray-400">
        {testimonial.channel && channelIcon(testimonial.channel)}
        <div className="text-xs">{testimonial.date}</div>
      </footer>
    </article>
  );
}
