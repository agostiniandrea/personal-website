import AdminFeedbackBoard from "@components/organisms/AdminFeedbackBoard";
import AdminLayout from "@components/organisms/AdminLayout";

export default function AdminFeedback() {
  return (
    <AdminLayout
      current="/admin/feedback"
      title="Feedback"
      description="What came in through the Forest form, and what to do with it."
    >
      <AdminFeedbackBoard />
    </AdminLayout>
  );
}
