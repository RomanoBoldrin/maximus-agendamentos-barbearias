import MainLayout from "@/components/layout/MainLayout";
import FeatureUnavailable from "@/components/common/FeatureUnavailable";

export default function FeatureUnavailablePage() {
  return <FeatureUnavailable />;
}

FeatureUnavailablePage.getLayout = function getLayout(page) {
  return <MainLayout>{page}</MainLayout>;
};
