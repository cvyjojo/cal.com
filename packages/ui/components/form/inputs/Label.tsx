import { classNames } from "@calcom/lib";

export function Label(props: JSX.IntrinsicElements["label"]) {
  return (
    <label
      {...props}
      // TODO: Test labels inside the app when dark theme is enabled as app doesn't support dark theme
      className={classNames(
        "mb-2 block text-sm font-medium leading-none text-gray-700 dark:text-white",
        props.className
      )}>
      <div>{props.children}</div>
    </label>
  );
}
