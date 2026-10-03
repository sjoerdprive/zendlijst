const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" });

export const formatDateTime = (value: Date): string => dateTimeFormat.format(value);

export const formatDate = (value: Date): string => dateFormat.format(value);
