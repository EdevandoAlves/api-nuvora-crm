type TrendPoint = { label: string; won: number; lost: number };

export function TrendChart({
  data,
  height = 208,
  formatY,
}: {
  data: TrendPoint[];
  height?: number;
  formatY?: (value: number) => string;
}) {
  const width = 680;
  const margin = { top: 12, right: 10, bottom: 24, left: 38 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const max = Math.max(...data.flatMap((point) => [point.won, point.lost])) * 1.15;
  const x = (index: number) =>
    margin.left + (index / Math.max(data.length - 1, 1)) * innerW;
  const y = (value: number) =>
    margin.top + innerH - (value / max) * innerH;

  const line = (key: "won" | "lost") =>
    data
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${x(index).toFixed(1)} ${y(
            point[key],
          ).toFixed(1)}`,
      )
      .join(" ");

  const area = `${line("won")} L ${x(data.length - 1).toFixed(1)} ${
    margin.top + innerH
  } L ${x(0).toFixed(1)} ${margin.top + innerH} Z`;

  const grid = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      className="trend-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Ganho e perda por semana"
    >
      {grid.map((step) => {
        const gy = margin.top + innerH * step;
        return (
          <line
            key={step}
            x1={margin.left}
            x2={width - margin.right}
            y1={gy}
            y2={gy}
            stroke="var(--line)"
            strokeDasharray={step === 0 ? "0" : "2 4"}
          />
        );
      })}
      {grid.map((step) => (
        <text
          key={`label-${step}`}
          x={margin.left - 8}
          y={margin.top + innerH * step + 3}
          textAnchor="end"
          fill="var(--faint)"
          fontFamily="var(--font-mono)"
          fontSize="10"
        >
          {formatY
            ? formatY(max * (1 - step))
            : `${Math.round(max * (1 - step))}k`}
        </text>
      ))}
      <path d={area} fill="var(--success-soft)" opacity="0.7" />
      <path
        d={line("lost")}
        fill="none"
        stroke="var(--chart-4)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <path
        d={line("won")}
        fill="none"
        stroke="var(--chart-2)"
        strokeWidth="2"
      />
      {data.map((point, index) => (
        <g key={point.label}>
          <circle
            cx={x(index)}
            cy={y(point.won)}
            r={index === data.length - 1 ? 3 : 1.8}
            fill="var(--chart-2)"
          />
          <text
            x={x(index)}
            y={height - 6}
            textAnchor="middle"
            fill="var(--faint)"
            fontFamily="var(--font-mono)"
            fontSize="10"
          >
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Donut({
  data,
  centerValue,
  centerLabel,
  size = 124,
}: {
  data: { label: string; value: number; tone: string }[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <svg
      viewBox="0 0 112 112"
      width={size}
      height={size}
      role="img"
      aria-label="Saúde da carteira"
    >
      <circle
        cx="56"
        cy="56"
        r={radius}
        fill="none"
        stroke="var(--surface-3)"
        strokeWidth="10"
      />
      {data.map((item, index) => {
        const length = (item.value / total) * circumference;
        const offset = data
          .slice(0, index)
          .reduce(
            (sum, previous) =>
              sum + (previous.value / total) * circumference,
            0,
          );
        const dash = `${length} ${circumference - length}`;
        return (
          <circle
            key={item.label}
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke={`var(--chart-${item.tone})`}
            strokeWidth="10"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            transform="rotate(-90 56 56)"
          />
        );
      })}
      <text
        x="56"
        y="53"
        textAnchor="middle"
        fill="var(--ink)"
        fontFamily="var(--font-mono)"
        fontSize="18"
        fontWeight="500"
      >
        {centerValue}
      </text>
      <text
        x="56"
        y="68"
        textAnchor="middle"
        fill="var(--muted)"
        fontFamily="var(--font-sans)"
        fontSize="9"
      >
        {centerLabel}
      </text>
    </svg>
  );
}

export function TrendBars({
  data,
}: {
  data: { label: string; won: number; lost: number }[];
}) {
  const max = Math.max(...data.flatMap((point) => [point.won, point.lost]));

  return (
    <div className="trend-bars" aria-label="Ganho e perda por semana">
      {data.map((point) => (
        <div className="trend-bars__group" key={point.label}>
          <div className="trend-bars__bars">
            <span
              className="trend-bars__bar trend-bars__bar--won"
              style={{ height: `${(point.won / max) * 100}%` }}
              title={`Ganho: R$ ${point.won} mil`}
            />
            <span
              className="trend-bars__bar trend-bars__bar--lost"
              style={{ height: `${(point.lost / max) * 100}%` }}
              title={`Perda: R$ ${point.lost} mil`}
            />
          </div>
          <small className="mono">{point.label}</small>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({
  data,
  tone = "var(--chart-1)",
  width = 72,
  height = 24,
}: {
  data: number[];
  tone?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={tone}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
