"use client";

import Box from "./Box";
import Chat from "./Chat";

const RightSidebar = () => {
  return (
    <div className="hidden lg:flex flex-col gap-y-2 bg-black h-full w-[300px] p-2 pl-0">
      <Box className="h-full overflow-y-auto">
        <Chat />
      </Box>
    </div>
  );
};

export default RightSidebar;
