import { useEffect } from "react";
import { useNavigate } from "react-router";
import HistoryRegister from "@features/stories/components/HistoryRegister";
import { useAuth } from "@lib/store/auth-store";

function StorySubmissionPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  return <div>{accessToken && <HistoryRegister />}</div>;
}

export default StorySubmissionPage;