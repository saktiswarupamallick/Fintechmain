import DashboardBox from "@/components/DashboardBox";
import FlexBetween from "@/components/FlexBetween";
import { useGetKpisQuery } from "@/state/api";
import { Box, Button, Typography, useTheme, Tooltip } from "@mui/material";
import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
  Area, 
} from "recharts";
import regression, { DataPoint } from "regression";

const Predictions = () => {
  const { palette } = useTheme();
  const [isPredictions, setIsPredictions] = useState(false);
  const { data: kpiData } = useGetKpisQuery();

  const formattedData = useMemo(() => {
    if (!kpiData) return [];
    const monthData = kpiData[0].monthlyData;

    const formatted: Array<DataPoint> = monthData.map(
      ({ revenue }, i: number) => {
        return [i, revenue];
      }
    );
    const regressionLine = regression.linear(formatted);

    return monthData.map(({ month, revenue }, i: number) => {
      return {
        name: month,
        "Actual Revenue": revenue,
        "Regression Line": regressionLine.points[i][1],
        "Predicted Revenue": regressionLine.predict(i + 12)[1],
      };
    });
  }, [kpiData]);

  return (
    <DashboardBox width="100%" height="100%" p="1rem" overflow="hidden">
      <FlexBetween m="1rem 2.5rem" gap="1rem">
        <Box>
          <Typography variant="h3">Revenue Insights & Forecasts</Typography>
          <Typography variant="h6">
            Analyzed historical revenue data alongside projected revenue using a linear regression model.
          </Typography>
        </Box>

        {/* Updated Button with Tooltip for Hover */}
        <Tooltip
          title="Show Predictions for the upcoming year "
          placement="top"
          arrow
        >
          <Button
            onClick={() => setIsPredictions(!isPredictions)}
            sx={{
              color: palette.grey[100],
              backgroundColor: palette.tertiary[300],
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              boxShadow: "0.2rem 0.2rem 0.3rem rgba(0,0,0,0.3)",
              fontSize: "1rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              transition: "background-color 0.3s ease, transform 0.3s ease",
              "&:hover": {
                backgroundColor: palette.tertiary[500],
                transform: "scale(1.05)",
              },
            }}
          >
            {isPredictions ? "Hide Predictions" : "Show Predictions"}
          </Button>
        </Tooltip>
      </FlexBetween>

      <ResponsiveContainer width="100%" height="100%">
  <LineChart
    data={formattedData}
    margin={{
      top: 20,
      right: 75,
      left: 20,
      bottom: 80,
    }}
  >
    <CartesianGrid strokeDasharray="3 3" stroke={palette.grey[800]} />
    <XAxis dataKey="name" tickLine={false} style={{ fontSize: "10px" }}>
      <Label value="Month" offset={-5} position="insideBottom" />
    </XAxis>
    <YAxis
      domain={[12000, 26000]}
      axisLine={{ strokeWidth: "0" }}
      style={{ fontSize: "10px" }}
      tickFormatter={(v) => `$${v}`}
    >
      <Label
        value="Revenue in USD"
        angle={-90}
        offset={-5}
        position="insideLeft"
      />
    </YAxis>
    <RechartTooltip />
    <Legend verticalAlign="top" />

    {/* Actual Revenue Line */}
    <Line
      type="monotone"
      dataKey="Actual Revenue"
      stroke={palette.primary.main}
      strokeWidth={0}
      dot={{ strokeWidth: 5 }}
    />

    {/* Regression Line */}
    <Line
      type="monotone"
      dataKey="Regression Line"
      stroke="#8884d8"
      dot={false}
    />

    {/* Filled Area under Regression Line */}
    <Area
      type="monotone"
      dataKey="Regression Line"
      stroke="#8884d8"
      fill="#8884d8"
      fillOpacity={0.3}
    />

    {/* Predicted Revenue Line (Toggled by Button) */}
    {isPredictions && (
      <Line
        strokeDasharray="5 5"
        dataKey="Predicted Revenue"
        stroke={palette.secondary[500]}
      />
    )}
  </LineChart>
</ResponsiveContainer>
    </DashboardBox>
  );
};

export default Predictions;
