/**
 * The HDI method in one figure: the child's, the parent's and a teacher's views meet in a single dossier,
 * which a person reviews. Labels are HTML (translated, and mirrored for right-to-left pages); the geometry is
 * symmetric so mirrored labels still sit on their points. The spokes draw in once on load unless the visitor
 * has asked for reduced motion.
 */
type Labels = {
  aria: string;
  child: string;
  childSub: string;
  parent: string;
  parentSub: string;
  teacher: string;
  teacherSub: string;
  core: string;
};

const TOP = [200, 78] as const;
const LEFT = [56, 286] as const;
const RIGHT = [344, 286] as const;
const CORE = [200, (78 + 286 + 286) / 3] as const;

export default function Triangulation({ l }: { l: Labels }) {
  const spoke = (p: readonly [number, number]) =>
    `M${p[0]} ${p[1]} L${CORE[0]} ${CORE[1]}`;
  return (
    <figure className="tri-fig" aria-label={l.aria}>
      <div className="tri">
        <svg viewBox="0 0 400 380" aria-hidden="true" focusable="false">
          <path
            className="edge"
            d={`M${TOP.join(" ")} L${LEFT.join(" ")} L${RIGHT.join(" ")} Z`}
          />
          <path className="spoke" d={spoke(TOP)} />
          <path className="spoke" d={spoke(LEFT)} />
          <path className="spoke" d={spoke(RIGHT)} />
          <circle className="core-ring" cx={CORE[0]} cy={CORE[1]} r="17" />
          <rect
            className="core"
            x={CORE[0] - 5}
            y={CORE[1] - 5}
            width="10"
            height="10"
            transform={`rotate(45 ${CORE[0]} ${CORE[1]})`}
          />
          <circle className="node" cx={TOP[0]} cy={TOP[1]} r="5" />
          <circle className="node" cx={LEFT[0]} cy={LEFT[1]} r="5" />
          <circle className="node" cx={RIGHT[0]} cy={RIGHT[1]} r="5" />
        </svg>
        <p className="tri-label tri-top">
          <b>{l.child}</b>
          <span>{l.childSub}</span>
        </p>
        <p className="tri-label tri-a">
          <b>{l.parent}</b>
          <span>{l.parentSub}</span>
        </p>
        <p className="tri-label tri-b">
          <b>{l.teacher}</b>
          <span>{l.teacherSub}</span>
        </p>
      </div>
      <figcaption className="tri-core">
        <span className="tri-mark" aria-hidden="true" />
        {l.core}
      </figcaption>
    </figure>
  );
}
