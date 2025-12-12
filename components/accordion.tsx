"use client";

import { useState, useEffect } from "react";

type AccordionItem = {
  question: string;
  answer: string;
};

type AccordionSingleProps = {
  children: React.ReactNode;
  title: string;
  id: string;
  active?: boolean;
  open?: boolean;
  items?: never;
};

type AccordionListProps = {
  items: AccordionItem[];
  children?: never;
  title?: never;
  id?: never;
  active?: never;
  open?: never;
};

type AccordionProps = AccordionSingleProps | AccordionListProps;

function AccordionSingle({
  children,
  title,
  id,
  active = false,
  open,
}: AccordionSingleProps) {
  const [accordionOpen, setAccordionOpen] = useState<boolean>(active);

  useEffect(() => {
    if (open !== undefined) {
      setAccordionOpen(open);
    }
  }, [open]);

  return (
    <div className="relative rounded-lg bg-white/70 shadow-sm shadow-black/[0.03] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] dark:bg-gray-800/70 dark:before:[background:linear-gradient(var(--color-gray-700),var(--color-gray-800))_border-box]">
      <h2>
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold dark:text-gray-100"
          onClick={(e) => {
            e.preventDefault();
            setAccordionOpen((prevState) => !prevState);
          }}
          aria-expanded={accordionOpen}
          aria-controls={`accordion-text-${id}`}
        >
          <span>{title}</span>
          <span className="ml-8 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white shadow-xs dark:bg-gray-700">
            <svg
              className={`origin-center transform fill-gray-400 dark:fill-gray-300 transition duration-200 ease-out ${accordionOpen && "rotate-180!"}`}
              xmlns="http://www.w3.org/2000/svg"
              width={10}
              height={6}
              fill="none"
            >
              <path
                d="m2 .586 3 3 3-3L9.414 2 5.707 5.707a1 1 0 0 1-1.414 0L.586 2 2 .586Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </h2>
      <div
        id={`accordion-text-${id}`}
        role="region"
        aria-labelledby={`accordion-title-${id}`}
        style={{
          maxHeight: accordionOpen ? '500px' : '0',
          opacity: accordionOpen ? 1 : 0,
          transition: 'max-height 300ms ease-in-out, opacity 300ms ease-in-out',
          overflow: 'hidden',
          willChange: 'max-height, opacity'
        }}
        className="text-sm text-gray-600 dark:text-gray-300"
      >
        <div>
          <p className="px-4 pb-3">{children}</p>
        </div>
      </div>
    </div>
  );
}

export default function Accordion(props: AccordionProps) {
  if ('items' in props && props.items) {
    return (
      <div className="space-y-3">
        {props.items.map((item, index) => (
          <AccordionSingle
            key={index}
            id={`faq-${index}`}
            title={item.question}
          >
            {item.answer}
          </AccordionSingle>
        ))}
      </div>
    );
  }

  return (
    <AccordionSingle
      title={props.title}
      id={props.id}
      active={props.active}
      open={props.open}
    >
      {props.children}
    </AccordionSingle>
  );
}
