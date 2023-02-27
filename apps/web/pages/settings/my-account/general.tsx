import type { InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { getLayout } from "@calcom/features/settings/layouts/SettingsLayout";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { nameOfDay } from "@calcom/lib/weekday";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import {
  Button,
  Form,
  Label,
  Meta,
  Select,
  showToast,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  TimezoneSelect,
  Tooltip,
} from "@calcom/ui";

import { withQuery } from "@lib/QueryCell";

export const getStaticProps = async () => {
  const res = await fetch(WEBAPP_URL + "/api/countrylist");
  const countries = await res.json();
  return {
    props: {
      countries: countries.countries,
    },
  };
};

const SkeletonLoader = ({ title, description }: { title: string; description: string }) => {
  return (
    <SkeletonContainer>
      <Meta title={title} description={description} />
      <div className="mt-6 mb-8 space-y-6 divide-y">
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />

        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
      </div>
    </SkeletonContainer>
  );
};

interface GeneralViewProps {
  localeProp: string;
  user: RouterOutputs["viewer"]["me"];
  countries: InferGetStaticPropsType<typeof getStaticProps>["countries"][string];
}

const WithQuery = withQuery(trpc.viewer.public.i18n, undefined, { trpc: { context: { skipBatch: true } } });

const GeneralQueryView = ({ countries }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t, i18n } = useLocale();
  const { data: user, isLoading } = trpc.viewer.me.useQuery();
  if (isLoading) return <SkeletonLoader title={t("general")} description={t("general_description")} />;
  if (!user) {
    throw new Error(t("something_went_wrong"));
  }
  return (
    <WithQuery
      success={({ data }) => (
        <GeneralView countries={countries[i18n.language]} user={user} localeProp={data.locale} />
      )}
      customLoader={<SkeletonLoader title={t("general")} description={t("general_description")} />}
    />
  );
};

const GeneralView = ({ countries, localeProp, user }: GeneralViewProps) => {
  const router = useRouter();
  const utils = trpc.useContext();
  const { t } = useLocale();

  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: async () => {
      // Invalidate our previous i18n cache
      await utils.viewer.public.i18n.invalidate();
      reset(getValues());
      showToast(t("settings_updated_successfully"), "success");
    },
    onError: () => {
      showToast(t("error_updating_settings"), "error");
    },
    onSettled: async () => {
      await utils.viewer.public.i18n.invalidate();
    },
  });

  const localeOptions = useMemo(() => {
    return (router.locales || []).map((locale) => ({
      value: locale,
      label: new Intl.DisplayNames(locale, { type: "language" }).of(locale) || "",
    }));
  }, [router.locales]);

  const timeFormatOptions = [
    { value: 12, label: t("12_hour") },
    { value: 24, label: t("24_hour") },
  ];

  const weekStartOptions = [
    { value: "Sunday", label: nameOfDay(localeProp, 0) },
    { value: "Monday", label: nameOfDay(localeProp, 1) },
    { value: "Tuesday", label: nameOfDay(localeProp, 2) },
    { value: "Wednesday", label: nameOfDay(localeProp, 3) },
    { value: "Thursday", label: nameOfDay(localeProp, 4) },
    { value: "Friday", label: nameOfDay(localeProp, 5) },
    { value: "Saturday", label: nameOfDay(localeProp, 6) },
  ];

  const formMethods = useForm({
    defaultValues: {
      locale: {
        value: localeProp || "",
        label: localeOptions.find((option) => option.value === localeProp)?.label || "",
      },
      timeZone: user.timeZone || "",
      country: user.country || "",
      timeFormat: {
        value: user.timeFormat || 12,
        label: timeFormatOptions.find((option) => option.value === user.timeFormat)?.label || 12,
      },
      weekStart: {
        value: user.weekStart,
        label: nameOfDay(localeProp, user.weekStart === "Sunday" ? 0 : 1),
      },
    },
  });
  const {
    formState: { isDirty, isSubmitting },
    reset,
    getValues,
  } = formMethods;
  const isDisabled = isSubmitting || !isDirty;
  return (
    <Form
      form={formMethods}
      handleSubmit={(values) => {
        mutation.mutate({
          ...values,
          locale: values.locale.value,
          timeFormat: values.timeFormat.value,
          weekStart: values.weekStart.value,
        });
      }}>
      <Meta title={t("general")} description={t("general_description")} />
      <Controller
        name="locale"
        render={({ field: { value, onChange } }) => (
          <>
            <Label className="text-gray-900">
              <>{t("language")}</>
            </Label>
            <Select<{ label: string; value: string }>
              className="capitalize"
              options={localeOptions}
              value={value}
              onChange={onChange}
            />
          </>
        )}
      />
      <Controller
        name="country"
        control={formMethods.control}
        render={({ field: { onChange, value } }) => {
          return (
            <>
              <Label className="mt-8 text-gray-900">
                <>{t("country")}</>
              </Label>
              <Select
                id="country"
                value={value ? { label: countries[value].name, value } : undefined}
                options={Object.keys(countries).map((countryCode) => ({
                  label: countries[countryCode].name,
                  value: countryCode,
                }))}
                onChange={(event) => {
                  event && onChange(event.value);
                }}
              />
            </>
          );
        }}
      />
      <Controller
        name="timeZone"
        control={formMethods.control}
        render={({ field: { value } }) => (
          <>
            <Label className="mt-8 text-gray-900">
              <>{t("timezone")}</>
            </Label>
            <TimezoneSelect
              id="timezone"
              value={value}
              onChange={(event) => {
                if (event) formMethods.setValue("timeZone", event.value, { shouldDirty: true });
              }}
            />
          </>
        )}
      />
      <Controller
        name="timeFormat"
        control={formMethods.control}
        render={({ field: { value } }) => (
          <>
            <Tooltip content={t("timeformat_profile_hint")}>
              <Label className="mt-8 text-gray-900">{t("time_format")}</Label>
            </Tooltip>

            <Select
              value={value}
              options={timeFormatOptions}
              onChange={(event) => {
                if (event) formMethods.setValue("timeFormat", { ...event }, { shouldDirty: true });
              }}
            />
          </>
        )}
      />
      <Controller
        name="weekStart"
        control={formMethods.control}
        render={({ field: { value } }) => (
          <>
            <Label className="mt-8 text-gray-900">
              <>{t("start_of_week")}</>
            </Label>
            <Select
              value={value}
              options={weekStartOptions}
              onChange={(event) => {
                if (event) formMethods.setValue("weekStart", { ...event }, { shouldDirty: true });
              }}
            />
          </>
        )}
      />
      <Button disabled={isDisabled} color="primary" type="submit" className="mt-8">
        <>{t("update")}</>
      </Button>
    </Form>
  );
};

GeneralQueryView.getLayout = getLayout;

export default GeneralQueryView;
