import { BodyShort, Panel } from "@navikt/ds-react";
import { Link } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import type { FunctionComponent } from "react";
import type { Kandidatlistesammendrag as Sammendrag } from "~/services/domene";
import css from "./Kandidatlistesammendrag.css";
import useVirksomhet from "~/services/useVirksomhet";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: css }];
};

type Props = {
    sammendrag: Sammendrag;
};

const Kandidatlistesammendrag: FunctionComponent<Props> = ({ sammendrag }) => {
    const { kandidatliste, antallKandidater } = sammendrag;
    const { tittel, opprettet, stillingId } = kandidatliste;
    const virksomhet = useVirksomhet();

    return (
        <Panel as="li" className="kandidatlistesammendrag">
            <span>
                <Link
                    to={`/kandidatliste/${stillingId}?virksomhet=${virksomhet}`}
                    className="navds-link"
                >
                    {tittel}
                </Link>
            </span>
            <BodyShort>Opprettet {formaterOpprettetTidspunkt(opprettet)}</BodyShort>
            <BodyShort>
                {antallKandidater} kandidat{antallKandidater === 1 ? "" : "er"}
            </BodyShort>
        </Panel>
    );
};

const formaterOpprettetTidspunkt = (tidspunkt: string) => {
    return new Date(tidspunkt).toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export default Kandidatlistesammendrag;
