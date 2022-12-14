import {
    BodyLong,
    BodyShort,
    Button,
    Checkbox,
    CheckboxGroup,
    Heading,
    Panel,
} from "@navikt/ds-react";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import type { ActionFunction, LinksFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { proxyTilApi } from "~/services/api/proxy";
import css from "./index.css";
import useVirksomhet from "~/services/useVirksomhet";
import { Back } from "@navikt/ds-icons";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: css }];

export const loader: LoaderFunction = async ({ request }) => {
    const respons = await proxyTilApi(request, "/samtykke");
    return respons.ok;
};

export const action: ActionFunction = async ({ request }) => {
    const body = await request.formData();
    const harGodkjent = body.get("samtykke") === "true";

    if (!harGodkjent) {
        return json("Du må huke av for å godta vilkårene.", { status: 422 });
    } else {
        const respons = await proxyTilApi(request, "/samtykke", "POST");

        if (respons.ok) {
            const virksomhet = new URL(request.url).searchParams.get("virksomhet");

            return redirect(`/kandidatliste?virksomhet=${virksomhet}`);
        } else {
            throw Error(`${respons.status}: ${respons.statusText}`);
        }
    }
};

const Samtykke: FunctionComponent = () => {
    const virksomhet = useVirksomhet();
    const feilmelding = useActionData<string | undefined>();
    const harSamtykket = useLoaderData<boolean>();

    return (
        <main className="side">
            <Panel className="samtykkeside">
                <div className="samtykkeside__topp">
                    <div className="samtykkeside__tilbakelenke">
                        {harSamtykket && (
                            <Link
                                to={`/kandidatliste?virksomhet=${virksomhet}`}
                                className="navds-link"
                            >
                                <Back /> Tilbake
                            </Link>
                        )}
                    </div>
                    <Heading level="2" size="large">
                        Vilkår
                    </Heading>
                </div>
                <Heading level="3" size="medium">
                    Hvem kan bruke tjenestene?
                </Heading>
                <BodyLong>
                    Arbeidsgiveren i en virksomhet gir tilganger til sine ansatte i Altinn. Har
                    flere ansatte fått tilgang til å publisere stillinger på Arbeidsplassen, kan de
                    se og utføre det samme, også endre det som en annen har lagt inn.
                </BodyLong>
                <Heading level="3" size="medium">
                    Bruk av opplysninger i CV-er
                </Heading>
                <BodyLong>
                    Du kan kun bruke opplysninger i CV-er hvis målet er å bemanne, rekruttere eller
                    oppfordre personer til å søke på stillinger.
                </BodyLong>
                <BodyLong>Det er ikke tillatt å bruke CV-er til andre formål, slik som å</BodyLong>
                <ul>
                    <li>
                        bruke opplysninger i forbindelse med salg eller markedsføring av varer eller
                        tjenester
                    </li>
                    <li>tilby arbeidssøkere stillinger der arbeidssøkeren må betale for å søke</li>
                    <li>tilby personer arbeidstreningsplasser</li>
                </ul>
                <BodyLong>NAV vil følge opp brudd på disse vilkårene hvis det forekommer.</BodyLong>
                <Form method="post">
                    <CheckboxGroup hideLegend legend="Godkjenner du vilkårene?">
                        <Checkbox name="samtykke" value="true">
                            Jeg har lest og godtar vilkårene.
                        </Checkbox>
                    </CheckboxGroup>
                    {feilmelding && (
                        <BodyShort className="samtykkeside__feilmelding">{feilmelding}</BodyShort>
                    )}
                    <Button type="submit">Godta vilkår</Button>
                </Form>
            </Panel>
        </main>
    );
};

export default Samtykke;
