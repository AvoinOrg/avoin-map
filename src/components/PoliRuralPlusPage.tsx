import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    page: {
      position: "fixed",
      inset: 0,
      zIndex: theme.zIndex.modal + 1,
      overflowY: "auto",
      backgroundColor: "#f7f9f7",
      color: "#1f2922",
    },
    article: {
      boxSizing: "border-box",
      width: "100%",
      maxWidth: 820,
      margin: "0 auto",
      padding: theme.spacing(5, 3, 8),
      fontSize: "1.05rem",
      lineHeight: 1.7,
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(8, 6, 10),
      },
    },
    backLink: {
      display: "inline-block",
      marginBottom: theme.spacing(4),
      color: "#26763a",
    },
    heading: {
      margin: theme.spacing(0, 0, 4),
      fontSize: "clamp(2rem, 5vw, 3rem)",
      lineHeight: 1.15,
    },
    paragraph: {
      margin: theme.spacing(0, 0, 3),
    },
    link: {
      color: "#26763a",
    },
    disclaimer: {
      marginTop: theme.spacing(5),
      fontSize: "0.95rem",
      color: "#465249",
    },
  })
);

const PoliRuralPlusPage = () => {
  const classes = useStyles({});

  return (
    <main className={classes.page}>
      <article className={classes.article}>
        <Link to="/" className={classes.backLink}>
          Back to Avoin Map
        </Link>

        <h1 className={classes.heading}>
          Avoin Map project completed under the PoliRuralPlus Develop Call
        </h1>

        <p className={classes.paragraph}>
          Avoin Map Oy coordinated the Avoin Map project, implemented in the
          Mallusjoki pilot region in Finland from October 2025 to June 2026.
          The project developed open-source spatial tools for sustainable rural
          development, climate-conscious planning and improved visibility of
          local activities.
        </p>

        <p className={classes.paragraph}>
          Together with Feydec Oy and Saatsi Arkkitehdit Oy, the project
          delivered three functioning pilot services: Energy Map, Zoning Map
          and Activity Map. Avoin Map Oy was responsible for project
          coordination and led the development of Energy Map and Activity Map,
          stakeholder co-design, shared technical infrastructure,
          documentation and dissemination. The project also contributed
          building-energy data to the PoliRuralPlus JackDaw environment.
        </p>

        <p className={classes.paragraph}>
          The project concluded in June 2026 with the approved work plan
          completed and all three services available for demonstration and
          continued development.
        </p>

        <p className={classes.paragraph}>
          <a
            className={classes.link}
            href="https://www.poliruralplus.eu/news/avoin-map-project-completes-three-pilot-services-for-sustainable-rural-development/"
          >
            Read more on the PoliRuralPlus webpage
          </a>
        </p>

        <p className={classes.disclaimer}>
          <em>
            PoliRuralPlus has received funding from the European Union’s
            Horizon Europe research and innovation programme under Grant
            Agreement No. 101136910. Views and opinions expressed are however
            those of the author(s) only and do not necessarily reflect those
            of the European Union or the European Research Executive Agency.
            Neither the European Union nor the granting authority can be held
            responsible for them.
          </em>
        </p>
      </article>
    </main>
  );
};

export default PoliRuralPlusPage;
