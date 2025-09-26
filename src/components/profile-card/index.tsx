import { Card } from "antd";
import React, { useEffect } from "react";
import { useAuth } from "@hooks/auth";
import { getProfile, ProfileResponse } from "@api/account";
import "./profile-card.scss";

const ProfileCard: React.FC = () => {
  const { session, callAuthenticatedApi } = useAuth();
  const [profile, setProfile] = React.useState<ProfileResponse | null>(null);

  useEffect(() => {
    callAuthenticatedApi(getProfile).then(setProfile);
  }, [session]);

  return profile ? (
    <Card size="small" hoverable className="profile-card">
      <Card.Meta
        avatar={<></>}
        title={profile.username}
        description={profile.accountId.split("-")[0]}
      />
    </Card>
  ) : (
    <div className="empty-profile" />
  );
};

export default ProfileCard;
