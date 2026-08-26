import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import PoliRuralPlusPage from "./PoliRuralPlusPage";

test("renders the supplied PoliRuralPlus project text and source link", () => {
  const { getByRole, getByText } = render(
    <MemoryRouter>
      <PoliRuralPlusPage />
    </MemoryRouter>
  );

  expect(
    getByRole("heading", {
      name: "Avoin Map project completed under the PoliRuralPlus Develop Call",
    })
  ).toBeInTheDocument();
  expect(getByText(/Mallusjoki pilot region/)).toBeInTheDocument();
  expect(getByText(/Grant Agreement No. 101136910/)).toBeInTheDocument();
  expect(
    getByRole("link", { name: "Read more on the PoliRuralPlus webpage" })
  ).toHaveAttribute(
    "href",
    "https://www.poliruralplus.eu/news/avoin-map-project-completes-three-pilot-services-for-sustainable-rural-development/"
  );
});
