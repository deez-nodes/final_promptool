import { Flex, Box } from "@chakra-ui/react"
import { useStore } from "@/store"
import { TopBar } from "@/components/TopBar"
import { LeftSidebar } from "@/components/LeftSidebar"
import { Canvas } from "@/components/Canvas"
import { RightSidebar } from "@/components/RightSidebar"

function App() {
  const leftOpen = useStore((s) => s.leftSidebarOpen)
  const rightOpen = useStore((s) => s.rightSidebarOpen)

  return (
    <Flex direction="column" h="100vh" bg={"app.bg"}>
      <TopBar />
      <Flex flex="1" overflow="hidden">
        {leftOpen && (
          <Box
            w="272px"
            flexShrink={0}
            borderRightWidth="1px"
            borderColor={"app.border"}
            overflow="hidden"
          >
            <LeftSidebar />
          </Box>
        )}
        <Box flex="1" overflow="hidden">
          <Canvas />
        </Box>
        {rightOpen && (
          <Box
            w="320px"
            flexShrink={0}
            borderLeftWidth="1px"
            borderColor={"app.border"}
            overflow="hidden"
          >
            <RightSidebar />
          </Box>
        )}
      </Flex>
    </Flex>
  )
}

export default App
