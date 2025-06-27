import {
  DiscordFilled,
  GithubFilled,
  GoogleOutlined,
  LinkedinFilled,
} from "@ant-design/icons";
import React from "react";
import "./contact.scss";

const ProductContact: React.FC = () => {
  return (
    <div className="about-product">
      <GithubFilled
        className="product-contact"
        onClick={() =>
          window.open("https://github.com/tranquanghuy7198/chainforge")
        }
      />
      <DiscordFilled
        className="product-contact"
        onClick={() => window.open("https://discord.gg/pW8kw8JX7s")}
      />
      <LinkedinFilled
        className="product-contact"
        onClick={() =>
          window.open("https://www.linkedin.com/in/quang-huy-tran-93725a172/")
        }
      />
      <a href="mailto:tranquanghuy7198@gmail.com">
        <GoogleOutlined className="product-contact" />
      </a>
    </div>
  );
};

export default ProductContact;
