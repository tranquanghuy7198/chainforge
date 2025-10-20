import { Card } from "antd";
import React from "react";
import { useFetchProfile } from "@hooks/account";
import "./profile-card.scss";

const ProfileCard: React.FC = () => {
  const { profile } = useFetchProfile();

  return profile ? (
    <Card size="small" className="profile-card">
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
