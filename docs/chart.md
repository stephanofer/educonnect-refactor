Chart
Copy Page

Previous
Next
Beautiful charts. Built using Recharts. Copy and paste into your apps.

Radix UI
Base UI
Note: We're working on upgrading to Recharts v3. In the meantime, if you'd like to start testing v3, see the code in the comment here. We'll have an official release soon.

Bar Chart - Interactive
Showing total visitors for the last 3 months

Desktop
7,324

Mobile
7,250
Introducing Charts. A collection of chart components that you can copy and paste into your apps.

Charts are designed to look great out of the box. They work well with the other components and are fully customizable to fit your project.

Browse the Charts Library.

Component
We use Recharts under the hood.

We designed the chart component with composition in mind. You build your charts using Recharts components and only bring in custom components, such as ChartTooltip, when and where you need it.

Copy
import { Bar, BarChart } from "recharts"
 
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
 
export function MyChart() {
  return (
    <ChartContainer>
      <BarChart data={data}>
        <Bar dataKey="value" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}
We do not wrap Recharts. This means you're not locked into an abstraction. When a new Recharts version is released, you can follow the official upgrade path to upgrade your charts.

The components are yours.

Installation
Command
Manual
pnpm
npm
yarn
bun
pnpm dlx shadcn@latest add chart
Copy
Your First Chart
Let's build your first chart. We'll build a bar chart, add a grid, axis, tooltip and legend.

Start by defining your data
The following data represents the number of desktop and mobile users for each month.

Note: Your data can be in any shape. You are not limited to the shape of the data below. Use the dataKey prop to map your data to the chart.

components/example-chart.tsx
Copy
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
Define your chart config
The chart config holds configuration for the chart. This is where you place human-readable strings, such as labels, icons and color tokens for theming.

components/example-chart.tsx
Copy
import { type ChartConfig } from "@/components/ui/chart"
 
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig
Build your chart
You can now build your chart using Recharts components.

Important: Remember to set a min-h-[VALUE] on the ChartContainer component. This is required for the chart to be responsive.

Copy
"use client"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart } from "recharts"
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig
export function ChartExample() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
View Code
Add a Grid
Let's add a grid to the chart.

Import the CartesianGrid component.
Copy
import { Bar, BarChart, CartesianGrid } from "recharts"
Add the CartesianGrid component to your chart.
Copy
<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
Copy
"use client"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid } from "recharts"
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig
export function ChartBarDemoGrid() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
View Code
Add an Axis
To add an x-axis to the chart, we'll use the XAxis component.

Import the XAxis component.
Copy
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
Add the XAxis component to your chart.
Copy
<ChartContainer config={chartConfig} className="h-[200px] w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
Copy
"use client"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig
export function ChartBarDemoAxis() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
View Code
Add Tooltip
So far we've only used components from Recharts. They look great out of the box thanks to some customization in the chart component.

To add a tooltip, we'll use the custom ChartTooltip and ChartTooltipContent components from chart.

Import the ChartTooltip and ChartTooltipContent components.
Copy
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
Add the components to your chart.
Copy
<ChartContainer config={chartConfig} className="h-[200px] w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
Copy
"use client"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig
export function ChartBarDemoTooltip() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
View Code
Hover to see the tooltips. Easy, right? Two components, and we've got a beautiful tooltip.

Add Legend
We'll do the same for the legend. We'll use the ChartLegend and ChartLegendContent components from chart.

Import the ChartLegend and ChartLegendContent components.
Copy
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
Add the components to your chart.
Copy
<ChartContainer config={chartConfig} className="h-[200px] w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
Copy
"use client"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig
export function ChartBarDemoLegend() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
View Code
Done. You've built your first chart! What's next?

Themes and Colors
Tooltip
Legend
Chart Config
The chart config is where you define the labels, icons and colors for a chart.

It is intentionally decoupled from chart data.

This allows you to share config and color tokens between charts. It can also work independently for cases where your data or color tokens live remotely or in a different format.

Copy
import { Monitor } from "lucide-react"
 
import { type ChartConfig } from "@/components/ui/chart"
 
const chartConfig = {
  desktop: {
    label: "Desktop",
    icon: Monitor,
    // A color like 'hsl(220, 98%, 61%)' or 'var(--color-name)'
    color: "#2563eb",
    // OR a theme object with 'light' and 'dark' keys
    theme: {
      light: "#2563eb",
      dark: "#dc2626",
    },
  },
} satisfies ChartConfig
Theming
Charts have built-in support for theming. You can use css variables (recommended) or color values in any color format, such as hex, hsl or oklch.

CSS Variables
Define your colors in your css file
app/globals.css
Copy
@layer base {
  :root {
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
  }
 
  .dark: {
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
  }
}
Add the color to your chartConfig
components/example-chart.tsx
Copy
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
hex, hsl or oklch
You can also define your colors directly in the chart config. Use the color format you prefer.

components/example-chart.tsx
Copy
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(220, 98%, 61%)",
  },
  tablet: {
    label: "Tablet",
    color: "oklch(0.5 0.2 240)",
  },
  laptop: {
    label: "Laptop",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
Using Colors
To use the theme colors in your chart, reference the colors using the format var(--color-KEY).

Components
Copy
<Bar dataKey="desktop" fill="var(--color-desktop)" />
Chart Data
components/example-chart.tsx
Copy
const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]
Tailwind
components/example-chart.tsx
Copy
<LabelList className="fill-[--color-desktop]" />
Tooltip
A chart tooltip contains a label, name, indicator and value. You can use a combination of these to customize your tooltip.

Label
Page Views
Desktop
186
Mobile
80
Name
Chrome
1,286
Firefox
1,000
Page Views
Desktop
12,486
Indicator
Chrome
1,286
You can turn on/off any of these using the hideLabel, hideIndicator props and customize the indicator style using the indicator prop.

Use labelKey and nameKey to use a custom key for the tooltip label and name.

Chart comes with the <ChartTooltip> and <ChartTooltipContent> components. You can use these two components to add custom tooltips to your chart.

components/example-chart.tsx
Copy
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
components/example-chart.tsx
Copy
<ChartTooltip content={<ChartTooltipContent />} />
Props
Use the following props to customize the tooltip.

Prop	Type	Description
labelKey	string	The config or data key to use for the label.
nameKey	string	The config or data key to use for the name.
indicator	dot line or dashed	The indicator style for the tooltip.
hideLabel	boolean	Whether to hide the label.
hideIndicator	boolean	Whether to hide the indicator.
Colors
Colors are automatically referenced from the chart config.

Custom
To use a custom key for tooltip label and names, use the labelKey and nameKey props.

Copy
const chartData = [
  { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]
 
const chartConfig = {
  visitors: {
    label: "Total Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig
components/example-chart.tsx
Copy
<ChartTooltip
  content={<ChartTooltipContent labelKey="visitors" nameKey="browser" />}
/>
This will use Total Visitors for label and Chrome and Safari for the tooltip names.

Legend
You can use the custom <ChartLegend> and <ChartLegendContent> components to add a legend to your chart.

components/example-chart.tsx
Copy
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
components/example-chart.tsx
Copy
<ChartLegend content={<ChartLegendContent />} />
Colors
Colors are automatically referenced from the chart config.

Custom
To use a custom key for legend names, use the nameKey prop.

Copy
const chartData = [
  { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]
 
const chartConfig = {
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig
components/example-chart.tsx
Copy
<ChartLegend content={<ChartLegendContent nameKey="browser" />} />
This will use Chrome and Safari for the legend names.