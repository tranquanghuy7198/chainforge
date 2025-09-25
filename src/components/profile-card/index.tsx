import { Card } from "antd";
import React from "react";
import "./profile-card.scss";

const ProfileCard: React.FC = () => {
  return (
    <Card size="small" hoverable className="profile-card">
      <Card.Meta
        avatar={<></>}
        title="Card title"
        description="This is the description"
      />
    </Card>
  );
};

export default ProfileCard;
