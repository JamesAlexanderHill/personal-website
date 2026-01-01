import { useState } from "react";
import { useForm } from "@tanstack/react-form";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    onSubmit: async ({ value }) => {
      console.log("Contact form submitted:", value);
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-secondary/20 bg-primary p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-secondary">Get in Touch</h2>
          <button
            onClick={onClose}
            className="text-secondary/60 transition-colors hover:text-secondary"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value ? "Name is required" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm text-secondary/80"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full rounded border border-secondary/20 bg-primary px-3 py-2 text-secondary outline-none transition-colors focus:border-accent"
                  placeholder="Your name"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-accent">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return "Invalid email address";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm text-secondary/80"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full rounded border border-secondary/20 bg-primary px-3 py-2 text-secondary outline-none transition-colors focus:border-accent"
                  placeholder="your@email.com"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-accent">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="message"
            validators={{
              onChange: ({ value }) =>
                !value ? "Message is required" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="message"
                  className="mb-1 block text-sm text-secondary/80"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={4}
                  className="w-full resize-none rounded border border-secondary/20 bg-primary px-3 py-2 text-secondary outline-none transition-colors focus:border-accent"
                  placeholder="Your message..."
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-accent">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded bg-accent px-4 py-2 font-medium text-primary transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
}
