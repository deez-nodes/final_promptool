<template>
  <UApp>
    <UDashboardGroup>
      <UDashboardSidebar
        id="prompts"
        collapsible
        resizable
        :default-size="15"
        :min-size="10"
        :max-size="20"
      >
        <template #header="{ collapsed }">
          <UIcon
            v-if="collapsed"
            name="i-lucide-list"
            class="size-5 mx-auto text-highlighted"
          />
          <span
            v-else
            class="font-semibold text-highlighted truncate"
          >Prompts</span>
        </template>

        <template #default="{ collapsed }">
          <p
            v-if="!collapsed"
            class="text-sm text-muted"
          >
            Prompts placeholder
          </p>
        </template>
      </UDashboardSidebar>

      <!--
        The resize handle sits between Editor and Panels. UDashboardPanel renders its
        handle on its trailing edge, so it is declared here; dragging it resizes the
        Panels column, which fills the remaining width.
      -->
      <UDashboardPanel
        id="editor"
        resizable
        :default-size="55"
        :min-size="30"
        :max-size="60"
      >
        <template #header>
          <UDashboardNavbar title="Editor">
            <template #leading>
              <UDashboardSidebarCollapse />
            </template>
          </UDashboardNavbar>
        </template>

        <template #body>
          <p class="text-sm text-muted">
            Editor placeholder
          </p>
        </template>
      </UDashboardPanel>

      <UDashboardPanel
        id="panels"
        class="hidden lg:flex"
      >
        <template #header>
          <UDashboardNavbar
            title="Panels"
            :toggle="false"
          />
        </template>

        <template #body>
          <p class="text-sm text-muted">
            Panels placeholder
          </p>
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
