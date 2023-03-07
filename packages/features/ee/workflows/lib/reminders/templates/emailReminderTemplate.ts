import dayjs from "@calcom/dayjs";
import { APP_NAME } from "@calcom/lib/constants";

const emailReminderTemplate = (
  isEditingMode: boolean,
  startTime?: string,
  endTime?: string,
  eventName?: string,
  timeZone?: string,
  attendee?: string,
  name?: string
) => {
  if (isEditingMode) {
    startTime = "{EVENT_TIME}";
    endTime = "{EVENT_END_TIME}";
    eventName = "{EVENT_NAME}";
    timeZone = "{TIMEZONE}";
    attendee = "{ATTENDEE_NAME}";
    name = "{NAME}";
  }

  const emailSubject = `Reminder: ${eventName} - ${dayjs(startTime)
    .tz(timeZone)
    .format("ddd, MMM D, YYYY")} ${dayjs(startTime).tz(timeZone).format("H:mmA")}`;

  const templateBodyText = `Hi ${name},this is a reminder that your meeting (${eventName}) with ${attendee} is on ${dayjs(
    startTime
  )
    .tz(timeZone)
    .format("YYYY MMM D")} at ${dayjs(startTime).tz(timeZone).format("h:mmA")} ${timeZone}.`;

  const introHtml = `<body>Hi${
    name ? " " + name : ""
  },<br><br>This is a reminder about your upcoming event.<br><br>`;

  const eventHtml = `<div style="font-weight: bold;">Event:</div>${eventName}<br><br>`;

  const dateTimeHtml = `<div style="font-weight: bold;">Date & Time:</div>${dayjs(startTime)
    .tz(timeZone)
    .format("ddd, MMM D, YYYY H:mmA")} - ${dayjs(endTime)
    .tz(timeZone)
    .format("H:mmA")} (${timeZone})<br><br>`;

  const attendeeHtml = `<div style="font-weight: bold;">Attendees:</div>You & ${attendee}<br><br>`;

  const endingHtml = `This reminder was triggered by a Workflow in Cal.<br><br>_<br><br>Scheduling by ${APP_NAME}</body>`;

  const templateBodyHtml = introHtml + eventHtml + dateTimeHtml + attendeeHtml + endingHtml;

  const emailBody = { text: templateBodyText, html: templateBodyHtml };

  return { emailSubject, emailBody };
};

export default emailReminderTemplate;
