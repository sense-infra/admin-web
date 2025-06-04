<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">System Monitoring</h1>
      <p class="text-gray-600">Monitor system health and performance</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">System Status</h3>
          <div class="flex items-center">
            <div class="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
            <span class="text-lg font-semibold text-gray-900">Healthy</span>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Active Alerts</h3>
          <p class="text-2xl font-bold text-red-600">3</p>
        </div>
      </div>
      
      <div class="card">
        <div class="p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Online Devices</h3>
          <p class="text-2xl font-bold text-green-600">67/68</p>
        </div>
      </div>
      
      <div class="card">
        <div class="p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Data Usage (24h)</h3>
          <p class="text-2xl font-bold text-blue-600">2.4 TB</p>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">System Components</h3>
        <div class="text-center py-8 text-gray-600">
          Detailed monitoring dashboards will be implemented here
        </div>
      </div>
    </div>
  </div>
</template>
