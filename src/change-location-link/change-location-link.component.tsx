import React from "react";
import Button from "carbon-components-react/es/components/Button";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Redirect } from "react-router-dom";
import styles from "./change-location.link.component.scss";
const openmrsSpaBase = window["getOpenmrsSpaBase"]();

interface ChangeLocationLinkProps {
  referer?: string;
}

const ChangeLocationLink: React.FC<ChangeLocationLinkProps> = ({ referer }) => {
  const { t } = useTranslation();
  const [navigate, setNavigate] = React.useState(false);

  const changeLocation = () => {
    setNavigate((prevState) => !prevState);
  };

  return (
    <BrowserRouter>
      {navigate ? (
        <Redirect
          // @ts-ignore
          to={{
            pathname: `${openmrsSpaBase}login/location`,
            state: {
              referrer: referer.slice(
                referer.indexOf(openmrsSpaBase) + openmrsSpaBase.length - 1
              ),
            },
          }}
        />
      ) : (
        <Button className={styles.changeLocationLink} onClick={changeLocation}>
          {t("change", "Change")}
        </Button>
      )}
    </BrowserRouter>
  );
};

export default ChangeLocationLink;
