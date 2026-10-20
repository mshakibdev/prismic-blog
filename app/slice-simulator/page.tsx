import {
  SliceSimulator,
  SliceSimulatorParams,
  getSlices,
} from "@prismicio/next";
import { SliceZone } from "@prismicio/react";
import { Suspense } from "react";

import { components } from "../../slices";

export default function SliceSimulatorPage(props: SliceSimulatorParams) {
  return (
    <Suspense fallback={<p>Loading slice preview…</p>}>
      <SliceSimulatorContent {...props} />
    </Suspense>
  );
}

async function SliceSimulatorContent({ searchParams }: SliceSimulatorParams) {
  const { state } = await searchParams;
  const slices = getSlices(state);

  return (
    <SliceSimulator>
      <SliceZone slices={slices} components={components} />
    </SliceSimulator>
  );
}
