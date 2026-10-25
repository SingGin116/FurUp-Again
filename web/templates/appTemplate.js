export const appTemplate = `
  <div
    v-cloak
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-8 relative min-h-screen"
  >
    <div class="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
      <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
    </div>

    <div class="wm-watermark" aria-hidden="true">
      FurUp · Bonny07 · 2025-11-27
    </div>
    <div class="wm-watermark" aria-hidden="true">FurUp Internal · Bonny07</div>
    <div class="wm-watermark" aria-hidden="true" data-tag="bonny07-signature">
      Made with care · FurUp
    </div>
    <div class="wm-watermark" aria-hidden="true" data-tag="furup-fingerprint-1">
      FurUp · layout fingerprint · f07a-2025
    </div>
    <div class="wm-watermark" aria-hidden="true" data-tag="furup-fingerprint-2">
      FurUp · dataset protected · 200-bars-default
    </div>
    <div class="wm-watermark" aria-hidden="true" data-tag="furup-fingerprint-scroll">
      FurUp · windowed-chart · 40-20-step
    </div>

    
    <header
      class="mb-0 sm:mb-6 flex flex-wrap items-center justify-between gap-4 py-2 sm:py-4 relative z-10 mx-auto w-full"
    >
      
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <div class="shrink-0 relative group">
            <div class="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg shadow-black/5 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img referrerpolicy="no-referrer" 
                    v-if="logoUrl" 
                    :src="logoUrl" 
                    alt="Logo" 
                    class="w-full h-full object-contain p-1 sm:p-1.5"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-base sm:text-xl">
                    Fu
                </div>
            </div>
        </div>
        <div class="flex flex-col justify-center h-10 sm:h-14 pl-0.5 sm:pl-1">
          <div class="flex items-center">

            <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity select-none" @click.prevent="activeModule = 'user-cards'">
              {{ strings.brandTitle }}
            </h1>
          </div>
          
          <div v-if="lastUpdated" class="flex mt-1 items-center gap-2 text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
             <span>{{ lastUpdated }} {{ strings.lastUpdatePrefix }}</span>
             <span class="text-slate-300 dark:text-slate-600">•</span>
             <span>{{ totalCreators }} {{ strings.creatorsUnit }}</span>
          </div>
        </div>
      </div>

      
      <div class="flex-1 min-w-0 flex items-center justify-end gap-2">
        
        <div
          v-if="!isMobile"
          class="group search-shell flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full border border-subtle shadow-sm px-3 sm:px-4 py-1.5 flex-1 w-0 min-w-0 max-w-[240px] transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:shadow-md h-9"
        >
          <div class="relative flex-1 min-w-0 text-main-color flex items-center">
            <svg
              class="shrink-0 w-3.5 h-3.5 text-subtle opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            
            <input
              v-model="activeSearchQuery"
              type="search"
              :placeholder="activeSearchPlaceholder"
              @search="activeSearchQuery = $event.target.value"
              class="w-full pl-2 pr-1 text-xs sm:text-sm bg-transparent border-none outline-none focus:ring-0 text-main-color placeholder-slate-400 dark:placeholder-slate-600 h-full min-w-0"
            />
          </div>
        </div>

        <button
          v-if="isMobile"
          type="button"
          @click="toggleMobileSearch"
          :title="strings.searchLabel"
          :aria-label="strings.searchLabel"
          :aria-expanded="showMobileSearch ? 'true' : 'false'"
          aria-controls="mobile-search-bar"
          class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-subtle text-subtle hover:text-main-color transition-colors shadow-sm"
          :class="{ 'ring-2 ring-blue-500/20 text-main-color': showMobileSearch }"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </button>

        
        <!-- QQ群按钮 -->
        <a
          href="https://qm.qq.com/q/Q0Wsv9A4Qa"
          target="_blank"
          rel="noopener noreferrer"
          class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-subtle hover:text-blue-500 dark:hover:text-blue-400 transition-colors shadow-sm"
          :title="strings.joinQQGroup || '加入QQ群'"
        >
          <svg class="w-4 h-4 sm:w-[18px] sm:h-[18px] text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29.43 2.239 0 6.29.256 6.29-.43 0-.687-1.77-1.182-1.77-1.182 2.085-1.77 1.904-3.967 1.904-3.967.846 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z"/>
          </svg>
        </a>

        <div class="flex items-center gap-1.5 shrink-0">
          <button
            id="theme-toggle"
            type="button"
            @click="toggleDarkMode"
            class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-subtle text-subtle hover:text-main-color transition-colors shadow-sm"
            :title="currentTheme === 'dark' ? strings.lightMode : strings.darkMode"
          >
            <span class="text-xs sm:text-sm">{{ currentTheme === 'dark' ? '☀' : '🌙' }}</span>
          </button>

          <button
            id="lang-toggle"
            type="button"
            @click="toggleLanguage"
            class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-subtle text-subtle hover:text-main-color transition-colors shadow-sm"
            :title="languageToggleTitle"
          >
             <span class="text-xs sm:text-sm">🌐</span>
          </button>
        </div>
      </div>
    </header>

    <div
      v-if="isMobile && showMobileSearch"
      id="mobile-search-bar"
      class="mt-2 mb-2 w-full"
    >
      <div
        class="group search-shell flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full border border-subtle shadow-sm px-3 py-1.5 w-full transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:shadow-md h-9"
      >
        <div class="relative flex-1 min-w-0 text-main-color flex items-center">
          <svg
            class="shrink-0 w-3.5 h-3.5 text-subtle opacity-70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          
          <input
            ref="mobileSearchInput"
            v-model="activeSearchQuery"
            type="search"
            :placeholder="activeSearchPlaceholder"
            @search="activeSearchQuery = $event.target.value"
            class="w-full pl-2 pr-1 text-xs bg-transparent border-none outline-none focus:ring-0 text-main-color placeholder-slate-400 dark:placeholder-slate-600 h-full min-w-0"
          />
        </div>
      </div>
    </div>

    
    
    <nav
      class="hidden md:block mb-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-full py-1 px-2.5 overflow-x-auto no-scrollbar border border-white/60 dark:border-slate-700/50 shadow-sm ring-1 ring-black/5 dark:ring-white/5"
    >
      <div class="flex flex-nowrap gap-2 w-fit min-w-full justify-center">
        <button type="button" class="module-tab shrink-0 min-w-[80px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'cards' }" @click="setActiveModule('cards')">
          {{ strings.buttonUserCards }}
        </button>
        <button type="button" class="module-tab shrink-0 min-w-[80px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'chart' }" @click="setActiveModule('chart')">
          {{ strings.buttonBarChart }}
        </button>
        <button type="button" class="module-tab shrink-0 min-w-[80px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'birthdays' }" @click="setActiveModule('birthdays')">
          {{ strings.buttonBirthdays }}
        </button>

        <button type="button" class="module-tab shrink-0 min-w-[80px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'costumes' }" @click="setActiveModule('costumes')">
          {{ strings.buttonCostumes }}
        </button>
        <button type="button" class="module-tab shrink-0 min-w-[80px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'meetups' }" @click="setActiveModule('meetups')">
          {{ strings.buttonMeetups }}
        </button>
        <button type="button" class="module-tab shrink-0 min-w-[80px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'guide' }" @click="setActiveModule('guide')">
          {{ strings.buttonGuide }}
        </button>
        <button type="button" class="module-tab shrink-0 min-w-[80px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'recommend' }" @click="setActiveModule('recommend')">
          {{ strings.buttonRecommend }}
        </button>
        <button type="button" class="module-tab shrink-0 min-w-[80px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'artists' }" @click="setActiveModule('artists')">
          {{ strings.buttonArtists }}
        </button>
        <button type="button" class="module-tab shrink-0 min-w-[80px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'thanks' }" @click="setActiveModule('thanks')">
          {{ strings.buttonThanks }}
        </button>
      </div>
    </nav>

    
    
    <div class="relative md:hidden mb-1 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-1 border border-white/60 dark:border-slate-700/50 shadow-sm">
        
        <nav
          ref="mobileNav"
          class="overflow-x-auto no-scrollbar scroll-smooth px-8"
          @scroll="onMobileNavScroll"
          style="mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%); -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);"
        >
          <div class="flex gap-2 w-fit min-w-full justify-center">
            <button type="button" class="module-tab shrink-0 min-w-[90px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'cards' }" @click="setActiveModule('cards', $event)">
            {{ strings.buttonUserCards }}
            </button>
            <button type="button" class="module-tab shrink-0 min-w-[90px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'chart' }" @click="setActiveModule('chart', $event)">
            {{ strings.buttonBarChart }}
            </button>
            <button type="button" class="module-tab shrink-0 min-w-[90px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'birthdays' }" @click="setActiveModule('birthdays', $event)">
            {{ strings.buttonBirthdays }}
            </button>

            <button type="button" class="module-tab shrink-0 min-w-[90px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'costumes' }" @click="setActiveModule('costumes', $event)">
            {{ strings.buttonCostumes }}
            </button>
            <button type="button" class="module-tab shrink-0 min-w-[90px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'meetups' }" @click="setActiveModule('meetups', $event)">
            {{ strings.buttonMeetups }}
            </button>
            <button type="button" class="module-tab shrink-0 min-w-[90px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'guide' }" @click="setActiveModule('guide', $event)">
            {{ strings.buttonGuide }}
            </button>
            <button type="button" class="module-tab shrink-0 min-w-[90px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'recommend' }" @click="setActiveModule('recommend', $event)">
            {{ strings.buttonRecommend }}
            </button>
            <button type="button" class="module-tab shrink-0 min-w-[90px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'artists' }" @click="setActiveModule('artists', $event)">
            {{ strings.buttonArtists }}
            </button>
            <button type="button" class="module-tab shrink-0 min-w-[90px] text-center whitespace-nowrap" :class="{ 'module-tab--active': activeModule === 'thanks' }" @click="setActiveModule('thanks', $event)">
            {{ strings.buttonThanks }}
            </button>
          </div>
        </nav>
        
        
        <div 
          v-show="mobileNavProgress >= 0.5"
          class="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500 transition-opacity duration-300"
        >
            <svg class="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </div>

        
        <div 
         v-show="mobileNavProgress < 0.5"
         class="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500 transition-opacity duration-300"
        >
            <svg class="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </div>
    </div>

    
    <div
      v-if="error"
      class="bg-rose-500/10 border border-rose-500/40 p-4 rounded-xl text-rose-600 dark:text-rose-200 mb-6 text-sm flex items-center gap-2"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      {{ strings.errorPrefix }} {{ error }}
    </div>

    <div v-else>
      
      <div
        v-if="loading"
        class="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-pulse"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="card-surface border rounded-2xl p-5 h-[140px] flex flex-col justify-between"
        >
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      
      <div v-else>
        
        <section
          v-if="activeModule === 'cards'"
          class="module-body space-y-4 relative"
        >
          <div
            v-if="filteredAccounts.length"
            id="cards-grid"
            class="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <article
              v-for="account in pagedAccounts"
              :key="account.uid"
              :id="'card-' + account.uid"
              @click="openProfile(account)"
              @keydown.enter.prevent="openProfile(account)"
              role="link"
              tabindex="0"
              :class="[
                'card-surface rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col gap-3 relative isolate overflow-hidden',
                highlightedUid === account.uid ? 'ring-2 ring-cyan-400/80 shadow-[0_0_30px_rgba(34,211,238,0.25)]' : ''
              ]"
            >
              
              <div class="flex items-start gap-3">
                <div class="relative shrink-0 cursor-pointer" @click="openModal(account)">
                  <img referrerpolicy="no-referrer"
                    :src="getAvatarUrl(account)"
 @error="onAvatarError($event, account)"
                    loading="lazy"
                    class="w-16 h-16 rounded-full object-cover border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    :alt="account.name"
                  />
                </div>

                <div class="flex-1 min-w-0 flex flex-col justify-center">
                  <h2 class="text-base sm:text-lg font-bold text-main-color truncate tracking-tight pr-2">
                    {{ account.name || '-' }}
                  </h2>
                  <div class="flex flex-wrap items-center gap-2 mt-0.5 min-h-[1.25rem]">
                    
                    <span v-if="account.birthday" class="text-[10px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-md flex items-center gap-1.5 border border-slate-100 dark:border-slate-700/50" :title="'Birthday: ' + account.birthday">
                      <svg class="w-3 h-3 text-slate-400 group-hover:text-pink-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2a1 1 0 011 1v3a1 1 0 11-2 0V3a1 1 0 011-1zM7 7a2 2 0 00-2 2v1h14V9a2 2 0 00-2-2H7zM4 11v8a2 2 0 002 2h12a2 2 0 002-2v-8H4z"/>
                      </svg>
                      <span class="font-sans tracking-wide text-slate-500 dark:text-slate-400">{{ account.birthday }}</span>
                    </span>
                      <span v-else class="text-xs text-subtle italic opacity-50 px-2"></span>
                    </div>
                  </div>
                </div>

                
                <div class="grid grid-cols-3 gap-2 py-2 border-t border-slate-50 dark:border-slate-800/50 mt-0">
                  
                  <div class="flex flex-col items-center gap-1">
                  <div class="text-[10px] text-[var(--premium-grey)] dark:text-[var(--premium-grey-dark)] uppercase tracking-wider font-semibold flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {{ strings.fansLabel }}
                  </div>
                  <span class="text-sm sm:text-base font-bold text-main-color font-mono numbers-font">
                    {{ formatNumberValue(account.followers) }}
                  </span>
                </div>

                
                <div class="flex flex-col items-center gap-1 border-l border-slate-100 dark:border-slate-800/50">
                   <div class="text-[10px] text-[var(--premium-grey)] dark:text-[var(--premium-grey-dark)] uppercase tracking-wider font-semibold flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ strings.likesLabel }}</span>
                  </div>
                  <span class="text-sm sm:text-base font-bold text-main-color font-mono numbers-font">
                    {{ formatNumberValue(account.likes) }}
                  </span>
                </div>

                
                <div class="flex flex-col items-center gap-1 border-l border-slate-100 dark:border-slate-800/50">
                   <div class="text-[10px] text-[var(--premium-grey)] dark:text-[var(--premium-grey-dark)] uppercase tracking-wider font-semibold flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ strings.playCountLabel }}</span>
                  </div>
                  
                  <span 
                    class="text-sm sm:text-base font-bold text-main-color font-mono numbers-font"
                    :title="account.playCount"
                  >
                    {{ formatNumberValue(account.playCount) }}
                  </span>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="text-subtle text-sm">
            {{ strings.noCreators }}
          </div>
        </section>

        
        <section
          v-show="activeModule === 'chart'"
          class="module-body"
        >
          <div class="fursuit-module-container relative overflow-hidden rounded-3xl p-4 sm:p-6 min-h-[600px] bg-slate-50/50 dark:bg-slate-900/20">
             
            <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[120px] pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-300/20 dark:bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

            <div class="relative z-10 space-y-3 mb-4">

              <div class="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

                <div class="flex items-start gap-2 sm:gap-3 min-w-0">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                    <span class="text-base sm:text-xl">📊</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h2 class="text-xl sm:text-2xl font-black text-main-color tracking-tight truncate">{{ strings.buttonBarChart }}</h2>
                    <p class="text-[10px] sm:text-xs font-medium text-subtle truncate">
                      {{ strings.chartHint }}
                    </p>
                  </div>
                </div>


                <div class="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto sm:shrink-0">
                  
                  <div class="metric-switch bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm" role="group" aria-label="chart metrics">
                    <button
                      v-for="option in metricOptions"
                      :key="option.key"
                      type="button"
                      class="metric-pill"
                      :class="[
                        chartMetric === option.key ? 'metric-pill--active' : '',
                        option.disabled ? 'opacity-60 cursor-not-allowed' : ''
                      ]"
                      :style="{ '--pill-color': option.color }"
                      @click="setMetric(option.key, option.disabled)"
                      :title="option.disabled ? strings.metricDisabled : ''"
                    >
                      <span class="metric-dot"></span>
                      {{ option.label }}
                    </button>
                  </div>


                  <div class="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                    <select
                      class="chart-topn-select shadow-sm text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5"
                      v-model.number="chartSkipCount"
                      @change="onChartFilterChange"
                    >
                      <option :value="0">{{ strings.skipNone }}</option>
                      <option :value="10">10%</option>
                      <option :value="25">25%</option>
                      <option :value="50">50%</option>
                      <option :value="75">75%</option>
                    </select>
                    <button type="button" class="chart-sort-btn shadow-sm text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5" @click="toggleChartSort">
                      {{ chartSortOrder === "desc" ? strings.sortDesc : strings.sortAsc }}
                    </button>
                    <button type="button" class="chart-sort-btn shadow-sm text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap" @click="toggleShowAll">
                      {{ chartShowAll ? strings.showDefaultLimit : strings.showAll }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            
            <div id="fans-chart" class="w-full rounded-2xl relative z-10 bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/50 shadow-sm p-1"></div>
          </div>
        </section>

        
        <section
          v-if="activeModule === 'guide'"
          class="module-body"
        >
          <div class="fursuit-module-container relative overflow-hidden rounded-3xl p-4 sm:p-6 min-h-[600px] bg-slate-50/50 dark:bg-slate-900/20">
            
            <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-300/20 dark:bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-teal-300/20 dark:bg-teal-500/10 blur-[100px] pointer-events-none"></div>

            
            <div class="relative z-10 mb-4 sm:mb-6 space-y-4">
              <div class="flex items-center justify-between gap-2 sm:gap-4">
                
                <div class="flex items-start gap-2 sm:gap-3 min-w-0">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                    <span class="text-base sm:text-xl">📚</span>
                  </div>
                  <div class="min-w-0">
                    <h2 class="text-2xl font-black text-main-color tracking-tight truncate">{{ guideTitle }}</h2>
                     <p class="text-[10px] sm:text-xs font-medium text-subtle truncate">
                      {{ strings.guideSubtitle }}
                    </p>
                  </div>
                </div>

                
                <div class="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm shrink-0">
                  <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1">
                     <button
                      type="button"
                      @click="guideView = 'videos'"
                      class="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5"
                      :class="guideView === 'videos' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
                    >
                      <span class="text-sm">📹</span>
                      <span>{{ strings.guideTabVideos }}</span>
                    </button>
                    <button
                      type="button"
                      @click="guideView = 'tutorials'"
                      class="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5"
                      :class="guideView === 'tutorials' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
                    >
                      <span class="text-sm">📄</span>
                      <span>{{ strings.guideTabArticles }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            
            <div v-show="guideView === 'videos'" class="relative z-10 animate-fade-in-up">
              
              <div v-if="loadingGuideVideos" class="flex flex-col items-center justify-center py-20">
                <div class="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p class="text-sm text-subtle">{{ strings.loadingShort }}</p>
              </div>

              
              <div v-else-if="guideVideosError" class="flex flex-col items-center justify-center py-20">
                <div class="w-16 h-16 mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl">
                  ❌
                </div>
                <p class="text-sm text-red-600 dark:text-red-400">{{ guideVideosError }}</p>
              </div>

              
              
              <div v-else-if="filteredGuideVideos.length > 0" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                <div
                  v-for="video in filteredGuideVideos"
                  :key="video.bvid"
                  @click="openBilibiliVideo(video.bvid)"
                  class="group cursor-pointer relative"
                >
                  
                  <div class="rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 ring-1 ring-black/5 dark:ring-white/5 h-full flex flex-col">
                    
                    
                    <div class="relative w-full pb-[56.25%] bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                      <img referrerpolicy="no-referrer"
                        v-if="video.cover"
                        :src="video.cover"
                        :alt="video.title"
                        class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      
                      
                      <div v-if="video.note" class="absolute top-2 left-2 max-w-[85%]">
                          <span class="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm line-clamp-1">
                              {{ video.note }}
                          </span>
                      </div>

                      
                      <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
                          <div class="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-emerald-500 shadow-lg scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
                              <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                      </div>

                      
                      <div class="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between px-2 sm:px-3 py-1 sm:py-1.5 text-white/90 text-[10px] sm:text-xs font-medium">
                        <div class="flex items-center gap-2 sm:gap-3">
                          <div class="flex items-center gap-1">
                            <svg class="w-3 h-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{{ formatVideoCount(video.view_count) }}</span>
                          </div>
                          <div class="flex items-center gap-1">
                             <svg class="w-3 h-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                             <span>{{ formatVideoCount(video.danmaku_count) }}</span>
                          </div>
                        </div>
                        <span class="bg-black/40 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]">{{ formatVideoDuration(video.duration) }}</span>
                      </div>
                    </div>

                    
                    <div class="p-2.5 sm:p-3.5 flex flex-col flex-1">
                      
                      <h3 class="text-xs sm:text-[14px] leading-snug font-bold text-slate-800 dark:text-slate-100 line-clamp-2 h-[2.6em] mb-1.5 sm:mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {{ video.title }}
                      </h3>

                      <div class="flex items-center justify-between mt-auto pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-700/50">
                        <div class="flex items-center gap-1.5 group-hover/author min-w-0">
                          <img referrerpolicy="no-referrer"
                            v-if="video.author_avatar"
                            :src="video.author_avatar"
                            :alt="video.author_name"
                            class="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover ring-1 ring-slate-100 dark:ring-slate-700 shrink-0"
                          />
                          <span class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 group-hover/author:text-emerald-600 transition-colors truncate">{{ video.author_name }}</span>
                        </div>
                        
                         <span class="text-[9px] sm:text-[10px] text-slate-400 shrink-0">{{ new Date(video.pub_date * 1000).toLocaleDateString() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
              <div v-else class="flex flex-col items-center justify-center py-20 text-center">
                <div class="w-20 h-20 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
                  📹
                </div>
                <p class="text-sm text-subtle">{{ strings.emptyGuideVideos }}</p>
              </div>
            </div>

            
            <div v-show="guideView === 'tutorials'" class="relative z-10 animate-fade-in-up">
              
              <div v-if="loadingGuideTutorials" class="flex flex-col items-center justify-center py-20">
                <div class="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p class="text-sm text-subtle">{{ strings.loadingShort }}</p>
              </div>

              
              <div v-else-if="guideTutorialsError" class="flex flex-col items-center justify-center py-20">
                <div class="w-16 h-16 mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl">
                  ❌
                </div>
                <p class="text-sm text-red-600 dark:text-red-400">{{ guideTutorialsError }}</p>
              </div>

              
              <div v-else-if="filteredGuideTutorials.length > 0" class="columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
                <div
                  v-for="(tutorial, index) in filteredGuideTutorials"
                  :key="tutorial.id"
                  @click="openTutorial(tutorial)"
                  class="break-inside-avoid group cursor-pointer"
                >
                  <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-slate-100 dark:ring-white/5 flex flex-col h-full">
                    
                    
                    <template v-if="tutorial.cover">
                      
                      <div class="aspect-video w-full relative overflow-hidden">
                        <img referrerpolicy="no-referrer" 
                          :src="tutorial.cover" 
                          :alt="tutorial.title"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                          <div class="bg-white/90 dark:bg-black/50 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                            <span>{{ strings.viewLabel }}</span>
                          </div>
                        </div>
                      </div>
                    </template>

                    
                    <template v-else>
                      <div 
                        class="aspect-video w-full relative p-4 flex flex-col items-center justify-center"
                        :class="[
                            'bg-gradient-to-br',
                            [
                                'from-rose-100 to-orange-100 dark:from-rose-900/40 dark:to-orange-900/40',
                                'from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40',
                                'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40',
                                'from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40',
                                'from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40'
                            ][index % 5]
                        ]"
                      >
                        
                        <div class="text-center px-2">
                          <h3 class="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200 leading-snug line-clamp-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {{ tutorial.title }}
                          </h3>
                        </div>
                      </div>
                    </template>

                    
                    <div class="p-3 sm:p-4 flex flex-col flex-1">
                      
                      <h3 v-if="tutorial.cover" class="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-snug mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {{ tutorial.title }}
                      </h3>
                      
                      
                      <p v-if="tutorial.description" class="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 mb-3 leading-relaxed">
                        {{ tutorial.description }}
                      </p>

                      
                      <div class="mt-auto flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                        <div class="flex items-center gap-1.5" v-if="tutorial.author">
                          <div class="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                            👤
                          </div>
                          <span class="truncate max-w-[80px]">{{ tutorial.author }}</span>
                        </div>
                        <div v-else></div>
                        <div v-if="tutorial.date" class="text-slate-400">
                          {{ tutorial.date.split('-').slice(1).join('/') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
              <div v-else class="flex flex-col items-center justify-center py-20 text-center">
                <div class="w-20 h-20 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
                  📄
                </div>
                <p class="text-sm text-subtle">{{ strings.emptyGuideArticles }}</p>
              </div>

              
              <div
                v-if="selectedTutorial"
                class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 transition-all"
                @click.self="closeTutorialModal"
              >
                <div
                  class="bg-white dark:bg-slate-900 rounded-2xl border border-subtle shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col transform transition-all scale-100 animate-fade-in-up"
                >
                  
                  <div
                    class="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-subtle bg-slate-50/50 dark:bg-slate-800/80 rounded-t-2xl"
                  >
                    <div class="flex-1 min-w-0 pr-4">
                      <h3 class="text-base sm:text-lg font-bold text-main-color truncate">
                        {{ selectedTutorial.title }}
                      </h3>
                      <div class="flex items-center gap-2 mt-0.5 text-xs text-subtle">
                         <span v-if="selectedTutorial.author">👤 {{ selectedTutorial.author }}</span>
                         <span v-if="selectedTutorial.date" class="opacity-50">•</span>
                         <span v-if="selectedTutorial.date">{{ selectedTutorial.date }}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-subtle hover:text-main-color hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
                      @click="closeTutorialModal"
                    >
                      ✕
                    </button>
                  </div>

                  
                  <div class="overflow-y-auto p-4 sm:p-6 space-y-4">
                     
                     <div v-if="selectedTutorial.cover" class="w-full rounded-xl overflow-hidden shadow-sm border border-subtle mb-2">
                        <img referrerpolicy="no-referrer" :src="selectedTutorial.cover" class="w-full h-auto object-cover" />
                     </div>
                     
                     
                     <div v-if="selectedTutorial.safeContent" class="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap" v-html="selectedTutorial.safeContent"></div>
                     <div v-else class="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {{ selectedTutorial.description }}
                     </div>
                     
                     
                     <div v-if="selectedTutorial.url" class="pt-4 border-t border-subtle mt-4">
                        <button 
                          @click="openExternal(selectedTutorial.url)"
                          class="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition flex items-center justify-center gap-2"
                        >
                          <span>{{ strings.readFullArticle }}</span>
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 00-2 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </button>
                     </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        
        <section
          v-if="activeModule === 'recommend'"
          class="module-body"
        >
          <div class="fursuit-module-container relative overflow-hidden rounded-3xl p-4 sm:p-6 min-h-[600px] bg-slate-50/50 dark:bg-slate-900/20">
            
            <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-orange-300/20 dark:bg-orange-500/10 blur-[120px] pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-amber-300/20 dark:bg-amber-500/10 blur-[100px] pointer-events-none"></div>


            <div class="relative z-10 mb-4 sm:mb-6 space-y-3">
              <div class="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap sm:items-center sm:gap-4">

                <div class="flex items-start gap-2 sm:gap-3 min-w-0">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                    <span class="text-base sm:text-xl">🎬</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h2 class="text-xl sm:text-2xl font-black text-main-color tracking-tight truncate">{{ recommendTitle }}</h2>
                     <p class="text-[10px] sm:text-xs font-medium text-subtle truncate">
                      {{ strings.recommendSubtitle }}
                    </p>
                  </div>
                </div>


                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 max-w-full sm:shrink-0">
                  
                  <div v-show="recommendView === 'videos'" class="flex items-center gap-1.5 p-1 sm:gap-2 sm:p-1.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm">
                    <button
                      type="button"
                      @click="cycleRecommendCategory"
                      class="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-1 sm:gap-1.5"
                      :class="recommendCategory === '全部' ? 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shadow-sm'"
                    >
                      <span>{{ getCategoryDisplay(recommendCategory).emoji }}</span>
                      <span>{{ getCategoryDisplay(recommendCategory).label }}</span>
                    </button>
                  </div>

                  
                  <div v-show="recommendView === 'games'" class="flex items-center gap-1.5 p-1 sm:gap-2 sm:p-1.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm">
                    <button
                      type="button"
                      @click="cycleRecommendGameType"
                      class="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-1 sm:gap-1.5"
                      :class="recommendGameType === '全部' ? 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shadow-sm'"
                    >
                      <span>{{ getGameTypeDisplay(recommendGameType).emoji }}</span>
                      <span>{{ getGameTypeDisplay(recommendGameType).label }}</span>
                    </button>
                  </div>

                  
                  <div class="flex flex-wrap items-center gap-1.5 p-1 sm:gap-2 sm:p-1.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm min-w-0 sm:shrink-0">
                    <div class="flex items-center gap-0.5 sm:gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-0.5 sm:p-1">
                      <button
                        v-for="view in recommendViews"
                        :key="view.key"
                        type="button"
                        @click="recommendView = view.key"
                        class="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-1 sm:gap-1.5"
                        :class="recommendView === view.key ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
                      >
                        <span class="text-xs sm:text-sm">{{ view.icon }}</span>
                        <span>{{ view.label }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            <div class="relative z-10 animate-fade-in-up">
              
              <div v-if="recommendView === 'videos'">
                
                <div v-if="loadingRecommendVideos" class="flex flex-col items-center justify-center py-20">
                  <div class="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                  <p class="text-sm text-subtle">{{ strings.loadingShort }}</p>
                </div>

                
                <div v-else-if="recommendVideosError" class="flex flex-col items-center justify-center py-20">
                  <div class="w-16 h-16 mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl">
                    ❌
                  </div>
                  <p class="text-sm text-red-600 dark:text-red-400">{{ recommendVideosError }}</p>
                </div>

                
                <div v-else-if="filteredRecommendVideos.length > 0" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                <div
                  v-for="video in filteredRecommendVideos"
                  :key="video.bvid"
                  @click="openRecommendVideo(video.bvid)"
                  class="group cursor-pointer relative"
                >
                  
                  <div class="rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 ring-1 ring-black/5 dark:ring-white/5 h-full flex flex-col">

                    
                    <div class="relative w-full pb-[56.25%] bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                      <img referrerpolicy="no-referrer"
                        v-if="video.cover"
                        :src="video.cover"
                        :alt="video.title"
                        loading="lazy"
                        decoding="async"
                        class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />



                      
                      <div v-if="video.note" class="absolute top-2 right-2 max-w-[60%]">
                          <span class="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm line-clamp-1">
                              {{ video.note }}
                          </span>
                      </div>

                      
                      <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
                          <div class="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-orange-500 shadow-lg scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
                              <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                      </div>

                      
                      <div class="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between px-2 sm:px-3 py-1 sm:py-1.5 text-white/90 text-[10px] sm:text-xs font-medium">
                        <div class="flex items-center gap-2 sm:gap-3">
                          <div class="flex items-center gap-1">
                            <svg class="w-3 h-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{{ formatRecommendCount(video.view_count) }}</span>
                          </div>
                          <div class="flex items-center gap-1">
                             <svg class="w-3 h-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                             <span>{{ formatRecommendCount(video.danmaku_count) }}</span>
                          </div>
                        </div>
                        <span class="bg-black/40 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]">{{ formatRecommendDuration(video.duration) }}</span>
                      </div>
                    </div>

                    
                    <div class="p-2.5 sm:p-3.5 flex flex-col flex-1">
                      <h3 class="text-xs sm:text-[14px] leading-snug font-bold text-slate-800 dark:text-slate-100 line-clamp-2 h-[2.6em] mb-1.5 sm:mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {{ video.title }}
                      </h3>

                      <div class="flex items-center justify-between mt-auto pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-700/50">
                        <div class="flex items-center gap-1.5 group-hover/author min-w-0">
                          <img referrerpolicy="no-referrer"
                            v-if="video.author_avatar"
                            :src="video.author_avatar"
                            :alt="video.author_name"
                            loading="lazy"
                            decoding="async"
                            class="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover ring-1 ring-slate-100 dark:ring-slate-700 shrink-0"
                          />
                          <span class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 group-hover/author:text-orange-600 transition-colors truncate">{{ video.author_name }}</span>
                        </div>

                         <div class="flex items-center gap-2 shrink-0">
                           <span v-if="video.category" class="text-[9px] sm:text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded border border-orange-100 dark:border-orange-800/50">
                              {{ getCategoryDisplay(video.category).label }}
                           </span>
                           <span class="text-[9px] sm:text-[10px] text-slate-400">{{ new Date(video.pub_date * 1000).toLocaleDateString() }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                
                <div v-else class="flex flex-col items-center justify-center py-20 text-center">
                  <div class="w-20 h-20 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
                    🎬
                  </div>
                  <p class="text-sm text-subtle">{{ strings.emptyRecommendVideos }}</p>
                </div>
              </div>

              
              <div v-if="recommendView === 'games'">
                
                <div v-if="loadingRecommendGames" class="flex flex-col items-center justify-center py-20">
                  <div class="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                  <p class="text-sm text-subtle">{{ strings.loadingShort }}</p>
                </div>

                
                <div v-else-if="recommendGamesError" class="flex flex-col items-center justify-center py-20">
                  <div class="w-16 h-16 mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl">
                    ❌
                  </div>
                  <p class="text-sm text-red-600 dark:text-red-400">{{ recommendGamesError }}</p>
                </div>

                
                <div v-else-if="filteredRecommendGames.length > 0" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  <div
                    v-for="game in filteredRecommendGames"
                    :key="game.id"
                    @click="openRecommendGame(game.url)"
                    class="group cursor-pointer relative"
                  >
                    
                    <div class="rounded-2xl overflow-hidden bg-white dark:bg-[#1b2838] shadow-sm hover:shadow-xl hover:shadow-orange-200/50 dark:shadow-none dark:hover:shadow-black/60 transition-all duration-300 group-hover:-translate-y-1.5 ring-1 ring-zinc-100 dark:ring-white/5 h-full flex flex-col relative">
                      
                      
                      <div class="relative w-full pb-[56.25%] bg-zinc-100 dark:bg-[#0f1922] overflow-hidden shrink-0">
                        <img referrerpolicy="no-referrer"
                          v-if="game.image"
                          :src="game.image"
                          :alt="game.name"
                          loading="lazy"
                          decoding="async"
                          class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        
                        <div v-else class="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-[#1b2838] dark:to-[#2a475e] flex items-center justify-center">
                           <span class="text-4xl opacity-10 grayscale dark:opacity-20">🎮</span>
                        </div>

                        
                        <div class="absolute inset-0 bg-black/10 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                          <div class="w-12 h-12 rounded-full bg-white dark:bg-[#66c0f4] shadow-lg scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 flex items-center justify-center text-orange-600 dark:text-[#1b2838]">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </div>
                        </div>

                        
                        <div class="absolute top-2.5 right-2.5">
                          <span
                            class="text-[9px] font-black px-2 py-1 rounded-md text-white uppercase tracking-widest shadow-md ring-1 ring-white/20 backdrop-blur-md"
                            :style="game.link_type === 'steam' ? 'background: linear-gradient(135deg, rgba(27,40,56,0.9), rgba(102,192,244,0.9))' : (
                                    game.link_type === 'qq' ? 'background: linear-gradient(135deg, rgba(18,183,245,0.9), rgba(0,163,255,0.9))' :
                                    'background: linear-gradient(135deg, rgba(102,126,234,0.9), rgba(118,75,162,0.9))')"
                          >
                            {{ game.link_type === 'steam' ? 'STEAM' : (game.link_type === 'qq' ? 'QQ Group' : 'WEB') }}
                          </span>
                        </div>
                      </div>

                      
                      <div class="p-3.5 flex flex-col flex-1 bg-white dark:bg-gradient-to-b dark:from-[#1b2838] dark:to-[#171a21]">
                         
                         <div class="mb-2">
                             <h3 class="text-sm font-black text-zinc-900 dark:text-[#c7d5e0] leading-snug line-clamp-1 mb-1 group-hover:text-orange-600 dark:group-hover:text-white transition-colors">
                               {{ game.name }}
                             </h3>
                             <div class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-[#5c7e92] font-medium">
                                 
                                 <span class="w-4 h-4 rounded bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-zinc-400 dark:text-[#5c7e92]">
                                    <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                 </span>
                                 <span class="truncate">{{ game.studio || 'Indie Studio' }}</span>
                             </div>
                         </div>

                         
                         <div v-if="game.note" 
                              class="text-[10px] text-zinc-600 dark:text-[#8f98a0] bg-zinc-50 dark:bg-[#000000]/20 p-2 rounded-lg mb-3 leading-relaxed border border-zinc-100 dark:border-white/5 max-h-[60px] overflow-hidden group-hover:overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent transition-all"
                              :title="game.note">
                            {{ game.note }}
                         </div>
                         <div v-else class="mb-3 flex-1"></div>

                         
                         <div class="mt-auto pt-3 border-t border-zinc-100 dark:border-white/10 flex items-center justify-between">
                            
                            <span v-if="game.link_type === 'steam'" class="text-[10px] font-bold text-orange-600 dark:text-[#4c6b22] flex items-center gap-1 bg-orange-50 dark:bg-[#4c6b22]/10 px-1.5 py-0.5 rounded border border-orange-100 dark:border-transparent">
                               In Library
                            </span>
                            <span v-else class="text-[10px] font-bold text-blue-600 dark:text-[#66c0f4] flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-100 dark:border-transparent">
                               Free to Play
                            </span>
                             
                            
                            <div class="flex items-center gap-1 text-[10px] font-bold text-zinc-400 dark:text-[#4f5d6a] group-hover:text-orange-600 dark:group-hover:text-white transition-colors">
                               <span>{{ strings.viewLabel || 'View Details' }}</span>
                               <svg class="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                
                <div v-else class="flex flex-col items-center justify-center py-20 text-center">
                  <div class="w-20 h-20 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
                    🎮
                  </div>
                  <p class="text-sm text-subtle">{{ strings.emptyRecommendGames }}</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section
          v-if="activeModule === 'meetups'"
          class="module-body"
        >
            <div class="fursuit-module-container relative overflow-hidden rounded-3xl p-4 sm:p-6 min-h-[600px] bg-slate-50/50 dark:bg-slate-900/20">
            
            <div class="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-300/10 dark:bg-blue-500/5 blur-[100px] pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-cyan-300/10 dark:bg-cyan-500/5 blur-[80px] pointer-events-none"></div>

            
            <div class="relative z-10 mb-3 sm:mb-6 space-y-2 sm:space-y-0">
              <!-- Row 1: Title + Download + Views (always) | Filters (sm+) -->
              <div class="flex flex-row flex-wrap items-center justify-between gap-2">
                <!-- Left: Title -->
                <div class="flex items-start gap-2 sm:gap-3 shrink-0">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                    <span class="text-base sm:text-xl">🎉</span>
                  </div>
                  <div>
                    <h2 class="text-lg sm:text-2xl font-black text-main-color tracking-tight">{{ meetupsTitle }}</h2>
                     <p class="text-[10px] sm:text-xs font-medium text-subtle truncate max-w-[80px] sm:max-w-none">
                      {{ upcomingMeetupsCount }} / {{ totalMeetupsCount }} {{ strings.meetupsEventsUnit }}
                    </p>
                  </div>
                </div>

                <!-- Right side container -->
                <div class="flex items-center gap-2 flex-wrap justify-end">
                  <!-- Download + View toggles -->
                  <div class="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1.5 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm shrink-0">
                    <!-- Download Calendar Button -->
                    <button
                      type="button"
                      @click="downloadAllMeetupsICS"
                      class="h-6 sm:h-9 px-1.5 sm:px-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700/50"
                      :title="strings.meetupsDownloadCalendar"
                    >
                      <span class="text-[10px] sm:text-sm">📥</span>
                      <span class="whitespace-nowrap hidden sm:inline">{{ strings.meetupsDownloadCalendar }}</span>
                    </button>

                    <div class="w-px h-4 sm:h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1"></div>
                    
                    <!-- View Toggle Buttons -->
                    <div class="flex items-center gap-0.5 sm:gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                       <button
                        type="button"
                        @click="meetupsView = 'cards'"
                        class="px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-0.5 sm:gap-1.5"
                        :class="meetupsView === 'cards' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
                      >
                        <span class="text-[10px] sm:text-sm">🏠</span>
                        <span class="hidden sm:inline">{{ strings.meetupsViewHome }}</span>
                      </button>
                      <button
                        type="button"
                        @click="meetupsView = 'calendar'"
                        class="px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-0.5 sm:gap-1.5"
                        :class="meetupsView === 'calendar' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
                      >
                        <span class="text-[10px] sm:text-sm">📅</span>
                        <span class="hidden sm:inline">{{ strings.meetupsViewCalendarShort }}</span>
                      </button>
                      <button
                        type="button"
                        @click="meetupsView = 'map'"
                        class="px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-0.5 sm:gap-1.5 hide-on-tiny"
                        :class="meetupsView === 'map' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
                      >
                        <span class="text-[10px] sm:text-sm">🗺️</span>
                        <span class="hidden sm:inline">{{ strings.meetupsViewMap }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Filters (hidden on narrow, shown on sm+) -->
                  <div class="hidden sm:flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1.5 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm">
                     <select v-model="selectedMeetupsProvince" class="h-6 sm:h-9 pl-1 sm:pl-3 pr-3 sm:pr-8 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 text-main-color border border-transparent focus:ring-0 focus:border-blue-500 transition-colors cursor-pointer outline-none appearance-none max-w-[60px] sm:max-w-none truncate">
                      <option v-for="province in meetupsProvinces" :key="province" :value="province">
                        {{ formatMeetupsRegionLabel(province) }}
                      </option>
                    </select>

                    <button
                      type="button"
                      @click="showPastMeetups = !showPastMeetups"
                      class="h-6 sm:h-9 px-1.5 sm:px-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-2 transition-colors border"
                      :class="!showPastMeetups ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'"
                    >
                      <span class="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                         <span v-if="!showPastMeetups" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                         <span class="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2" :class="!showPastMeetups ? 'bg-blue-500' : 'bg-slate-400'"></span>
                      </span>
                      <span class="whitespace-nowrap">{{ showPastMeetups ? strings.meetupsIncludeEnded : strings.meetupsUpcomingOnly }}</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Row 2: Filters (visible only on narrow screens) -->
              <div class="flex sm:hidden items-center justify-end gap-1">
                <div class="flex items-center gap-1 p-0.5 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm">
                   <select v-model="selectedMeetupsProvince" class="h-6 pl-1 pr-3 rounded-lg text-[10px] font-bold bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 text-main-color border border-transparent focus:ring-0 focus:border-blue-500 transition-colors cursor-pointer outline-none appearance-none max-w-[60px] truncate">
                    <option v-for="province in meetupsProvinces" :key="province" :value="province">
                      {{ formatMeetupsRegionLabel(province) }}
                    </option>
                  </select>

                  <button
                    type="button"
                    @click="showPastMeetups = !showPastMeetups"
                    class="h-6 px-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors border"
                    :class="!showPastMeetups ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'"
                  >
                    <span class="relative flex h-1.5 w-1.5">
                       <span v-if="!showPastMeetups" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                       <span class="relative inline-flex rounded-full h-1.5 w-1.5" :class="!showPastMeetups ? 'bg-blue-500' : 'bg-slate-400'"></span>
                    </span>
                    <span class="whitespace-nowrap">{{ showPastMeetups ? strings.meetupsIncludeEnded : strings.meetupsUpcomingOnly }}</span>
                  </button>
                </div>
              </div>
            </div>

            
            <div v-if="loadingMeetups" class="relative z-10 flex flex-col items-center justify-center py-20">
              <div class="relative">
                <div class="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
                <div class="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <p class="mt-4 text-sm font-medium text-blue-500 animate-pulse">{{ strings.meetupsLoading }}</p>
            </div>

            <div v-else-if="meetupsLoadError" class="relative z-10 text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-rose-300 dark:border-rose-700/50">
              <div class="text-4xl mb-4">🧩</div>
              <div class="text-base font-bold text-rose-500 mb-1">
                {{ meetupsLoadError }}
              </div>
              <button @click="loadMeetups" class="text-xs text-rose-400 hover:text-rose-500 underline">
                {{ strings.retryLabel }}
              </button>
            </div>

            
            <div v-else class="relative z-10">
              
              
              
              <div v-if="meetupsView === 'calendar'" class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/60 dark:border-slate-700/60 shadow-lg shadow-blue-900/5 overflow-hidden ring-1 ring-white/40 dark:ring-white/5">
                
                <div class="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-700/50 relative z-10">
                   
                   <div class="flex items-baseline gap-2">
                      <span class="text-2xl sm:text-3xl font-black text-main-color tracking-tight font-mono">
                        {{ meetupsCalendar.year }}.{{ meetupsCalendar.month < 10 ? '0' + meetupsCalendar.month : meetupsCalendar.month }}
                      </span>
                      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">
                        {{ strings.currentMonthLabel }}
                      </span>
                   </div>

                   
                  <div class="flex items-center bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1 gap-1 border border-slate-200 dark:border-slate-800">
                    <button 
                       @click="changeMeetupsMonth(-1)" 
                       class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div class="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                    <button 
                       @click="changeMeetupsMonth(1)" 
                       class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                </div>

                
                <div class="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                  <div v-for="(w, idx) in meetupsWeekdays" :key="w" class="py-2 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider" :class="idx === 0 || idx === 6 ? 'text-rose-400 dark:text-rose-400/80' : 'text-slate-400 dark:text-slate-500'">
                    {{ w }}
                  </div>
                </div>

                
                <div class="grid grid-cols-7 auto-rows-fr bg-slate-100 dark:bg-slate-800/50 gap-px border-b border-l border-slate-200 dark:border-slate-800">
                   <div
                    v-for="(cell, idx) in meetupsCalendar.cells"
                    :key="idx"
                    class="relative min-h-[80px] sm:min-h-[110px] transition-colors flex flex-col group p-1"
                    :class="[
                      cell.isToday ? 'bg-blue-50/40 dark:bg-blue-900/10' : (cell.type === 'empty' ? 'bg-slate-50/50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80'),
                      (idx % 7 === 0 || idx % 7 === 6) && cell.type !== 'empty' && !cell.isToday ? 'bg-slate-50/30 dark:bg-slate-900/30' : ''
                    ]"
                    @click="cell.type === 'day' && cell.meetups && cell.meetups.length ? openMeetupsModal(cell.day, cell.meetups) : null"
                  >
                    <template v-if="cell.type === 'day'">
                       
                      <div class="flex justify-between items-start mb-1 h-6">
                        <span 
                          class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold font-mono transition-none"
                          :class="cell.isToday ? 'bg-rose-500 text-white' : (idx % 7 === 0 || idx % 7 === 6 ? 'text-rose-400 dark:text-rose-500/80' : 'text-slate-700 dark:text-slate-300')"
                        >
                          {{ cell.day }}
                        </span>
                      </div>

                      
                      <div class="flex-1 flex flex-col gap-1 w-full overflow-hidden" v-if="cell.meetups && cell.meetups.length">
                        <template v-for="(m, i) in cell.meetups.slice(0, 3)" :key="m.id">
                           <div 
                              class="w-full border rounded px-1 py-0.5 flex items-center gap-1 overflow-hidden transition-all duration-300"
                              :class="[
                                m.isPast ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'bg-blue-100/50 dark:bg-blue-900/30 border-blue-200/50 dark:border-blue-800/30',
                                m.isPast && !showPastMeetups ? 'opacity-40 grayscale' : 'opacity-100'
                              ]"
                              :title="m.name"
                           >
                              
                              <span 
                                class="text-[9px] sm:text-[10px] font-medium truncate leading-none pt-0.5"
                                :class="m.isPast ? 'text-slate-400 dark:text-slate-500 decoration-slate-400' : 'text-blue-900 dark:text-blue-100'"
                              >{{ m.name }}</span>
                           </div>
                        </template>
                        
                        
                        <div v-if="cell.meetups.length > 3" class="text-[9px] text-slate-400 pl-1 font-medium">
                           +{{ cell.meetups.length - 3 }} more...
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>


              
              <div v-else-if="meetupsView === 'map'" class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative min-h-[600px] flex flex-col ring-1 ring-black/5 dark:ring-white/5">
                 
                 
                 <div class="absolute top-4 left-4 z-20">
                     <div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md pl-3 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-lg flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
                           <span class="text-sm">🗺️</span>
                        </div>
                        <div class="flex flex-col">
                           <h3 class="text-sm font-black text-main-color leading-none">{{ strings.heatmapTitle }}</h3>
                           <p class="text-[10px] text-subtle font-bold uppercase tracking-wide">{{ meetups ? meetups.length : 0 }} {{ strings.meetupsEventsText }}</p>
                        </div>
                     </div>
                 </div>

                  
                  <div v-if="meetupsMap.status === 'missing'" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30">
                     <span class="text-5xl mb-4 grayscale opacity-30 select-none">🌍</span>
                     <span class="text-sm font-medium text-slate-400">{{ strings.mapDataMissing }}</span>
                  </div>
                  
                   <div v-if="meetupsMap.status === 'loading'" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                      <div class="relative">
                         <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-amber-500"></div>
                         <div class="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-amber-500">MAP</div>
                      </div>
                   </div>

                  <div class="relative w-full h-full min-h-[600px] flex-1">
                    <div id="meetups-map" class="absolute inset-0 w-full h-full bg-[#f8fafc] dark:bg-[#0f172a]"></div>

                    
                    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                    <div v-if="meetupsMap.status === 'ready' && meetupsMap.topRegions && meetupsMap.topRegions.length" 
                         class="absolute top-4 right-4 z-10 w-56 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-xl overflow-hidden hidden sm:block">
                         
                         <div class="px-4 py-3 border-b border-slate-100/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                            <span class="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">{{ strings.meetupsTopRegions }}</span>
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                         </div>
                         
                         <div class="p-2 space-y-1">
                            <div v-for="(item, idx) in meetupsMap.topRegions" :key="item.name" 
                                 class="flex items-center justify-between p-2 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors group cursor-default">
                                <div class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shadow-sm"
                                          :class="idx === 0 ? 'bg-amber-100 text-amber-600' : (idx === 1 ? 'bg-slate-200 text-slate-600' : (idx === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-400 bg-slate-100 dark:bg-slate-700/50'))">
                                        {{ idx + 1 }}
                                    </div>
                                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ item.name }}</span>
                                </div>
                                <span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{{ item.value }}</span>
                            </div>
                        </div>
                    </div>
                    </transition>

                    
                    <div v-if="meetupsMap.status === 'ready'" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                      <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-full shadow-2xl p-1.5 flex items-center gap-1 group transition-all hover:scale-105 duration-300">
                        <button
                          @click="zoomOutMap"
                          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition active:scale-95"
                          title="Zoom Out"
                        >
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                        </button>
                        
                        <div class="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>

                        <button
                          @click="resetMapZoom"
                          class="px-4 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition active:scale-95 text-xs font-bold uppercase tracking-wider"
                          title="Reset View"
                        >
                          {{ strings.resetMapView }}
                        </button>

                         <div class="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>

                        <button
                          @click="zoomInMap"
                          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition active:scale-95"
                          title="Zoom In"
                        >
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        </button>
                      </div>
                    </div>

                  </div>
              </div>


              
              <div v-else>
                
                
                <div v-if="selectedMeetupsProvinceFromMap || (selectedMeetupsProvince && selectedMeetupsProvince !== '__ALL__')" class="mb-5 relative group">
                   <div class="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-orange-100/20 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl"></div>
                   <div class="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-amber-100 dark:border-slate-700/50 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                      <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-600 dark:text-amber-500 flex items-center justify-center text-xl shadow-inner uppercase font-black">
                             {{ (selectedMeetupsProvinceFromMap || selectedMeetupsProvince || '').charAt(0) }}
                          </div>
                          <div>
                             <div class="flex items-center gap-2 mb-0.5">
                                <span class="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/30">
                                   {{ strings.provinceLabel }}
                                </span>
                             </div>
                             <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">
                                {{ formatMeetupsRegionLabel(selectedMeetupsProvinceFromMap || selectedMeetupsProvince) }}
                             </h3>
                          </div>
                      </div>

                      <button
                          @click="selectedMeetupsProvinceFromMap = null; selectedMeetupsProvince = '__ALL__'"
                          class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-white hover:bg-rose-500 dark:hover:bg-rose-500 transition-all duration-300 group/clear"
                          :title="strings.clearFilter || 'Clear'"
                       >
                          <svg class="w-4 h-4 transition-transform group-hover/clear:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                   </div>
                </div>

                
                <div v-if="!selectedMeetupsProvinceFromMap && selectedMeetupsProvince === '__ALL__' && !meetupsSearchQuery && nextBigMeetup"
                     class="mb-4 grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-5">
                    
                    
                    <div class="col-span-1 sm:col-span-8 relative overflow-hidden rounded-2xl group shadow-sm border border-white/50 dark:border-slate-700/50 h-full">
                        
                        <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-amber-50 dark:from-slate-800 dark:via-indigo-950/30 dark:to-slate-900 z-0"></div>
                        
                        
                        <div class="absolute top-[-20%] right-[-10%] w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl pointer-events-none mix-blend-multiply dark:mix-blend-overlay"></div>
                        
                        
                        <div class="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px] z-0"></div>

                        
                        <div class="p-3 sm:p-5 flex flex-col h-full justify-between relative z-10 w-full">
                            
                            
                            <div class="w-full flex items-center justify-between mb-2">
                                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-white/10 text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-900/70 dark:text-indigo-200">
                                    <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                    <span>{{ nextBigMeetup.status === 'upcoming' ? (locale === 'ja-JP' ? '次回の開催' : (locale === 'zh-CN' ? '即将开始' : 'Next Up')) : (locale === 'ja-JP' ? '開催中' : (locale === 'zh-CN' ? '正在进行' : 'Now')) }}</span>
                                </span>
                            </div>

                            
                            <div class="flex items-start gap-3 sm:gap-4 flex-1 sm:items-center">
                                
                                <div class="shrink-0 w-12 h-12 sm:w-20 sm:h-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl p-1 shadow-sm border border-white/50 dark:border-white/10 ring-1 ring-white/50">
                                    <img referrerpolicy="no-referrer" v-if="nextBigMeetup.logo" :src="nextBigMeetup.logo" class="w-full h-full object-contain rounded-lg" :alt="nextBigMeetup.name">
                                    <div v-else class="w-full h-full flex items-center justify-center text-xl sm:text-3xl">🐾</div>
                                </div>
                                
                                
                                <div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                                    
                                    
                                    <div class="flex flex-col justify-center">
                                        
                                        <h2 class="text-sm sm:text-2xl font-black leading-tight tracking-tight text-slate-800 dark:text-slate-100 drop-shadow-sm truncate w-full mb-1">{{ nextBigMeetup.name }}</h2>
                                        
                                        <div class="flex flex-col gap-0.5">
                                            <p class="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 truncate">
                                                <span>📍 {{ nextBigMeetup.city }}</span>
                                            </p>
                                            <p class="text-xs sm:text-base text-slate-500 dark:text-slate-400 font-mono font-bold flex items-center gap-1 truncate">
                                                <span>📅 {{ formatMeetupDateRange(nextBigMeetup) }}</span>
                                            </p>
                                        </div>
                                    </div>

                                    
                                    
                                    
                                    <div class="flex gap-1.5 sm:gap-2 mt-2 sm:mt-0 sm:flex-col sm:items-end sm:ml-auto">
                                        <button 
                                            @click.stop="openMeetupWebsite(nextBigMeetup)"
                                            :disabled="!nextBigMeetup.website"
                                            class="flex-1 sm:flex-none justify-center px-3 py-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs sm:text-sm font-bold transition shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 h-8 sm:h-auto sm:w-28"
                                        >
                                            🔗 <span class="hidden sm:inline">{{ getMeetupLinkTypeDisplay(nextBigMeetup).label }}</span>
                                        </button>
                                        <button 
                                            @click.stop="copyMeetupGroup(nextBigMeetup)"
                                            :disabled="!nextBigMeetup.qq_group"
                                            class="flex-1 sm:flex-none justify-center px-3 py-1 bg-slate-800 hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-sm shadow-slate-800/20 rounded-lg text-xs sm:text-sm font-bold transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 h-8 sm:h-auto sm:w-28"
                                        >
                                            💬 <span class="hidden sm:inline">{{ meetupsCopiedId === nextBigMeetup.id ? 'OK' : 'Group' }}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div class="col-span-1 sm:col-span-4 grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-1 gap-2 h-full">
                        
                        <div @click="meetupsView = 'map'" class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border border-amber-100 dark:border-slate-700 rounded-2xl p-3 cursor-pointer hover:shadow-md transition group relative overflow-hidden flex flex-col justify-center h-20 sm:h-auto">
                             
                             <div class="absolute top-0 right-0 w-16 h-16 bg-orange-400/10 rounded-full blur-lg pointer-events-none"></div>

                             <div class="relative z-10 flex flex-col h-full justify-center">
                                <div class="flex items-center justify-between">
                                    <h3 class="font-black text-amber-900/80 dark:text-amber-100 text-lg sm:text-2xl leading-none tracking-tight">
                                        {{ strings.meetupsViewMap || 'Map' }}
                                    </h3>
                                    <span class="text-4xl sm:text-5xl font-black text-amber-500/90 leading-none tracking-tighter">{{ meetupsRegionCount || 0 }}</span>
                                </div>
                                <p class="text-xs sm:text-sm text-amber-800/60 dark:text-amber-200/60 font-bold uppercase tracking-wider leading-tight mt-1">
                                   {{ strings.meetupsRegionsLabel }}
                                </p>
                             </div>
                             
                             
                             <svg class="absolute -right-3 -bottom-3 w-12 h-12 text-amber-500 opacity-10 group-hover:opacity-20 transition duration-500 transform group-hover:scale-110 group-hover:-rotate-6" fill="currentColor" viewBox="0 0 24 24">
                               <path d="M15 19l-7-2.192-4.575 2.875A1 1 0 0 1 2 18.825V4.288a1 1 0 0 1 1.487-.905L9 6.075l5 1.562 3.513-2.193A1 1 0 0 1 19 6.273v14.542a1 1 0 0 1-1.487.905L15 19zm-6-2.5l5 1.562V5.5l-5-1.562v12.5z"/>
                             </svg>
                        </div>

                        
                        <div @click="meetupsView = 'calendar'" class="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 border border-emerald-100 dark:border-slate-700 rounded-2xl p-3 cursor-pointer hover:shadow-md transition group relative overflow-hidden flex flex-col justify-center h-20 sm:h-auto">
                            
                            <div class="absolute top-0 right-0 w-16 h-16 bg-emerald-400/10 rounded-full blur-lg pointer-events-none"></div>

                             <div class="relative z-10 flex flex-col h-full justify-center">
                                <div class="flex items-center justify-between">
                                    <h3 class="font-black text-emerald-900/80 dark:text-emerald-100 text-lg sm:text-2xl leading-none tracking-tight">
                                        {{ strings.meetupsViewCalendar || 'Calendar' }}
                                    </h3>
                                    <span class="text-4xl sm:text-5xl font-black text-emerald-500/90 leading-none tracking-tighter">{{ meetups ? meetups.length : 0 }}</span>
                                </div>
                                <p class="text-xs sm:text-sm text-emerald-800/60 dark:text-emerald-200/60 font-bold uppercase tracking-wider leading-tight mt-1">
                                   {{ strings.meetupsEventsLabel }}
                                </p>
                             </div>
                             
                             
                             <svg class="absolute -right-3 -bottom-3 w-12 h-12 text-emerald-500 opacity-10 group-hover:opacity-20 transition duration-500 transform group-hover:scale-110 group-hover:rotate-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
                             </svg>
                        </div>
                    </div>
                </div>

                <div v-if="filteredMeetups.length > 0" id="meetups-cards-container" class="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <article
                    v-for="meetup in filteredMeetups"
                    :key="meetup.id"
                    class="group relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"
                  >
                     <div class="h-1.5 w-full" :class="getMeetupGradient(meetup)"></div>



                    <div class="p-3 sm:p-5 flex-1 flex flex-col gap-2 sm:gap-4">
                      
                      <div class="flex items-start justify-between">
                         <div class="flex flex-col items-center bg-slate-50 dark:bg-slate-700/50 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-600 p-1.5 sm:p-2 min-w-[2.5rem] sm:min-w-[3.5rem] text-center">
                             <span class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase leading-none mb-0.5 sm:mb-1">{{ strings.monthsShort ? strings.monthsShort[meetup.month - 1] : meetup.month }}</span>
                             <span class="text-base sm:text-xl font-bold text-main-color leading-none font-mono tracking-tighter">{{ meetup.day }}</span>
                          </div>
                         
                         <div class="flex flex-col items-end gap-1">
                            <span class="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-black uppercase tracking-wide border shadow-sm"
                              :class="[
                                meetup.status === 'upcoming' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 
                                meetup.status === 'ongoing' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800' : 
                                'bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600'
                              ]"
                            >
                               {{ meetupCountdownText(meetup) }}
                            </span>
                         </div>
                      </div>

                      
                      <div class="flex flex-row items-start gap-2 sm:gap-4">
                         
                          <div class="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-1 shadow-sm transition-transform relative overflow-hidden">
                             <div v-if="meetup.force_color_bg" class="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/30"></div>
                             <img referrerpolicy="no-referrer" v-if="meetup.logo" :src="meetup.logo" class="w-full h-full object-contain rounded-lg sm:rounded-xl relative z-10" :alt="meetup.name" loading="lazy">
                             <div v-else class="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-slate-300 relative z-10">🐾</div>
                          </div>
                         
                         <div class="flex-1 min-w-0">
                            <h3 class="text-sm sm:text-lg font-black text-main-color leading-tight mb-1 line-clamp-2 transition-colors">
                              {{ meetup.name }}
                            </h3>
                            <div class="flex items-center text-xs text-subtle truncate text-slate-500">
                               <span class="shrink-0">
                                 <svg class="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                               </span>
                               <span class="ml-1 truncate">{{ meetup.city }}</span>
                               <span v-if="meetup.province && meetup.province !== meetup.city" class="opacity-50 mx-1">·</span>
                               <span v-if="meetup.province && meetup.province !== meetup.city" class="truncate">{{ meetup.province }}</span>
                            </div>
                         </div>
                      </div>

                      
                      <div class="space-y-2 mt-1 bg-slate-50 dark:bg-slate-900/30 rounded-xl p-3">
                         <div class="flex items-center justify-between text-xs">
                           <span class="text-slate-400">{{ strings.durationLabel }}</span>
                           <span class="font-medium text-slate-600 dark:text-slate-300 font-mono">{{ formatMeetupDateRange(meetup) }}</span>
                         </div>
                         <div class="flex items-center justify-between text-xs" v-if="meetup.qq_group">
                           <span class="text-slate-400">{{ strings.qqGroupLabel }}</span>
                           <span class="font-medium text-slate-600 dark:text-slate-300 font-mono select-all">{{ meetup.qq_group }}</span>
                         </div>
                      </div>
                    </div>

                    
                    <div class="grid grid-cols-2 border-t border-slate-100 dark:border-slate-700/50 divide-x divide-slate-100 dark:divide-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                        <button
                          type="button"
                          @click.stop="openMeetupWebsite(meetup)"
                          :disabled="!meetup.website"
                          class="py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                           <span>🔗</span> {{ getMeetupLinkTypeDisplay(meetup).label }}
                        </button>
                        <button
                          type="button"
                          @click.stop="copyMeetupGroup(meetup)"
                          :disabled="!meetup.qq_group"
                          class="py-3 text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                          :class="meetupsCopiedId === meetup.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700'"
                        >
                           <span v-if="meetupsCopiedId === meetup.id">✓</span>
                           <span v-else>📋</span>
                           <span class="hidden sm:inline">{{ meetupsCopiedId === meetup.id ? strings.meetupsCopied : strings.meetupsCopyGroup }}</span>
                           <span class="sm:hidden">{{ meetupsCopiedId === meetup.id ? '✓' : 'QQ' }}</span>
                        </button>
                    </div>
                  </article>
                </div>
                
                <div v-else class="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                   <span class="text-4xl mb-3 opacity-50">🍃</span>
                   <p class="text-slate-500 font-medium">{{ strings.meetupsEmpty }}</p>
                </div>
              </div>
            </div>

            
            <div
              v-if="meetupsModal.open"
              class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 p-4"
              @click.self="closeMeetupsModal"
            >
               <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
                
                <div class="relative h-20 bg-gradient-to-br from-blue-500 to-cyan-400 shrink-0 flex items-center px-6">
                   <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                   <div class="relative z-10 text-white">
                      <div class="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">{{ meetupsModal.year }}</div>
                      <div class="text-3xl font-black font-mono">{{ meetupsModal.month }}.{{ meetupsModal.day }}</div>
                   </div>
                   <button @click="closeMeetupsModal" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition">✕</button>
                </div>
                
                <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
                   <article
                    v-for="meetup in meetupsModal.meetups"
                    :key="meetup.id"
                    class="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4"
                  >
                     <img referrerpolicy="no-referrer" v-if="meetup.logo" :src="meetup.logo" class="w-12 h-12 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700" loading="lazy">
                     <div v-else class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">🐾</div>

                     <div class="flex-1 min-w-0">
                        <h4 class="text-base font-bold text-main-color leading-tight mb-1">{{ meetup.name }}</h4>
                        <div class="flex flex-wrap text-xs text-subtle gap-2 mb-2">
                           <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{{ meetup.province !== meetup.city ? meetup.province + ' · ' + meetup.city : meetup.city }}</span>
                           <span class="text-blue-500 font-medium" v-if="meetup.status === 'upcoming'">{{ meetupCountdownText(meetup) }}</span>
                           <span class="text-emerald-500 font-medium" v-if="meetup.status === 'ongoing'">{{ meetupCountdownText(meetup) }}</span>
                           <span class="text-slate-500 font-medium" v-if="meetup.status === 'ended'">{{ meetupCountdownText(meetup) }}</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                           <button v-if="meetup.website" @click="openMeetupWebsite(meetup)" class="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">{{ getMeetupLinkTypeDisplay(meetup).label }}</button>
                           <button v-if="meetup.qq_group" @click="copyMeetupGroup(meetup)" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">{{ strings.meetupsCopyGroup }}</button>
                           <button @click="downloadMeetupICS(meetup)" class="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition flex items-center justify-center gap-1">📅 {{ strings.meetupsAddCalendar }}</button>
                        </div>
                     </div>
                  </article>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        
        <section
          v-if="activeModule === 'costumes'"
          class="module-body"
        >
          <div class="fursuit-module-container relative overflow-hidden rounded-3xl p-4 sm:p-6 min-h-[600px] bg-slate-50/50 dark:bg-slate-900/20">
            
            <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-300/20 dark:bg-purple-500/10 blur-[120px] pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-cyan-300/20 dark:bg-cyan-500/10 blur-[100px] pointer-events-none"></div>

            
            <div class="relative z-10 mb-3 sm:mb-6 space-y-4">
              <div class="flex flex-row items-center justify-between gap-2">
                
                <div class="flex items-start gap-2 sm:gap-3 shrink-0">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                    <span class="text-base sm:text-xl">🦊</span>
                  </div>
                  <div>
                    <h2 class="text-lg sm:text-2xl font-black text-main-color tracking-tight">{{ costumesTitle }}</h2>
                     <p class="text-[10px] sm:text-xs font-medium text-subtle truncate max-w-[80px] sm:max-w-none">
                      {{ studioCount.filtered }} / {{ studioCount.total }} {{ strings.studiosUnit }}
                    </p>
                  </div>
                </div>

                
                <div class="flex flex-wrap items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm shrink-0">
                   
                   <button
                    type="button"
                    @click="cycleRegionFilter"
                    class="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-1 sm:gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700/50"
                  >
                    <span class="text-xs sm:text-sm">🌍</span>
                    <span>{{ getRegionLabel() }}</span>
                  </button>

                  <div class="w-px h-4 sm:h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 hidden sm:block"></div>

                  
                  <button
                    type="button"
                    @click="cycleStyleFilter"
                    class="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-1 sm:gap-1.5"
                    :class="selectedStyle === 'All' ? 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shadow-sm'"
                  >
                    <span>🎨</span>
                    <span>{{ getStyleFilterLabel }}</span>
                  </button>

                  <div class="w-px h-4 sm:h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 hidden sm:block"></div>

                  
                  <button
                    type="button"
                    @click="toggleYearSort"
                    class="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center gap-1 sm:gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700/50"
                  >
                    <span class="text-xs sm:text-sm">⇅</span>
                    <span>{{ getSortLabel() }}</span>
                  </button>
                </div>
              </div>
            </div>

            
            <div v-if="loadingStudios" class="relative z-10 text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 dark:border-slate-600 border-t-blue-500"></div>
              <p class="mt-4 text-sm text-subtle">{{ strings.loadingShort }}</p>
            </div>

            
            <div v-else-if="filteredStudios.length > 0" class="relative z-10 grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
              <article
                v-for="studio in filteredStudios"
                :key="studio.id"
                class="group relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"
              >
                
                <div class="h-1.5 w-full" :class="getStudioGradient(studio)"></div>

                <div class="p-3 sm:p-5 flex-1 flex flex-col gap-2 sm:gap-4">
                  
                  <div class="flex items-start justify-between">
                    
                    <div class="flex flex-col items-center bg-slate-50 dark:bg-slate-700/50 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-600 p-1.5 sm:p-2 min-w-[2.5rem] sm:min-w-[3.5rem] text-center">
                       <span class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase leading-none mb-0.5 sm:mb-1">{{ strings.estLabel }}</span>
                       <span class="text-base sm:text-xl font-bold text-main-color leading-none font-mono tracking-tighter">{{ studio.founded_year || '-' }}</span>
                    </div>

                     
                     <div class="flex items-center gap-1 sm:gap-2">
                        
                        <span v-if="getMakerTypeDisplay(studio)" class="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide border shadow-sm bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600 flex items-center gap-1.5">
                           {{ getMakerTypeDisplay(studio) }}
                        </span>

                        
                        <span class="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide border shadow-sm bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600 flex items-center gap-1.5">
                           <span>{{ regionLabels[studio.region] || studio.region }}</span>
                        </span>
                     </div>
                  </div>

                  
                  <div class="flex flex-row items-start gap-2 sm:gap-4">
                     
                     <div class="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-1 shadow-sm relative overflow-hidden">
                        
                        <div class="absolute inset-0 opacity-10" :class="getStudioGradient(studio)"></div>
                        <div v-if="studio.force_color_bg" class="absolute inset-0 opacity-30" :class="getStudioGradient(studio)"></div>
                        <img referrerpolicy="no-referrer" v-if="studio.cover_image" :src="studio.cover_image" class="w-full h-full object-contain rounded-lg sm:rounded-xl relative z-10" :alt="getStudioDisplayName(studio)" loading="lazy">
                        <div v-else class="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-slate-300 relative z-10">🦊</div>
                     </div>

                     <div class="flex-1 min-w-0 flex flex-col justify-center h-auto sm:h-16">
                        <h3 class="text-sm sm:text-lg font-black text-main-color leading-tight mb-1 line-clamp-2">
                          {{ getStudioDisplayName(studio) }}
                        </h3>
                         
                          <div class="flex items-center gap-2 flex-wrap">
                             <span
                                v-for="s in (Array.isArray(studio.style) ? studio.style : (studio.style ? [studio.style] : []))"
                                :key="s"
                                class="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                             >
                                {{ getStyleDisplay(s) }}
                             </span>
                          </div>

                      </div>
                   </div>

                   
                   <div class="space-y-2 mt-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl p-3 border border-slate-100 dark:border-slate-800/50">
                      
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-400">{{ strings.qqGroupLabel }}</span>
                        <span v-if="studio.qq_group" class="font-medium text-slate-600 dark:text-slate-300 font-mono text-right">{{ studio.qq_group }}</span>
                        <span v-else class="font-medium text-slate-300 dark:text-slate-600 text-right">{{ strings.noneLabel }}</span>
                      </div>

                      
                      <div class="flex items-start justify-between text-xs">
                         <span class="shrink-0 text-slate-400 mr-2">{{ strings.noteLabel }}</span>
                         <span v-if="studio.note" class="font-medium text-slate-600 dark:text-slate-300 text-right leading-relaxed opacity-90">{{ studio.note }}</span>
                         <span v-else class="font-medium text-slate-300 dark:text-slate-600 text-right">{{ strings.noneLabel }}</span>
                      </div>
                   </div>
                </div>

                
                <div class="grid grid-cols-2 border-t border-slate-100 dark:border-slate-700/50 divide-x divide-slate-100 dark:divide-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                    <button
                      type="button"
                      @click="openStudioWebsite(studio)"
                      :disabled="!studio.homepage_url"
                      class="py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                       <span>🔗</span>
                       <span>{{ getLinkTypeDisplay(studio).label }}</span>
                    </button>
                    
                    
                    <button
                       type="button"
                       @click.stop="copyStudioGroup(studio)"
                       :disabled="!studio.qq_group"
                       class="py-3 text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                       :class="studiosCopiedId === studio.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700'"
                    >
                       <span v-if="studiosCopiedId === studio.id">✓</span>
                       <span v-else>📋</span>
                       <span class="hidden sm:inline">{{ studiosCopiedId === studio.id ? strings.meetupsCopied : strings.meetupsCopyGroup }}</span>
                       <span class="sm:hidden">{{ studiosCopiedId === studio.id ? '✓' : strings.qqShort }}</span>
                    </button>
                </div>
              </article>
            </div>

          
          <div v-else class="relative z-10 text-center py-12 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <span class="text-4xl mb-3 opacity-50 block">🦊</span>
            <p class="text-subtle text-sm">{{ filteredStudios.length === 0 && studios.length > 0 ? strings.costumesEmptyFiltered : strings.costumesEmpty }}</p>
          </div>
          </div>
        </section>

        
        <section
          v-if="activeModule === 'artists'"
          class="module-body"
        >
          <div class="fursuit-module-container relative overflow-hidden rounded-3xl p-4 sm:p-6 min-h-[600px] bg-slate-50/50 dark:bg-slate-900/20">
            
            <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-300/20 dark:bg-purple-500/10 blur-[120px] pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-pink-300/20 dark:bg-pink-500/10 blur-[100px] pointer-events-none"></div>


            <div class="relative z-10 mb-6">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <span class="text-xl">🎨</span>
                </div>
                <div class="flex-1">
                  <h2 class="text-2xl font-black text-main-color tracking-tight">{{ artistsTitle }}</h2>
                  <p class="text-xs font-medium text-subtle">
                    {{ strings.artistsSubtitle }}
                  </p>
                </div>
                <!-- Creator Type Filter Button -->
                <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm">
                  <button
                    type="button"
                    @click="cycleCreatorType"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700/50"
                  >
                    <span>🎨</span>
                    <span>{{ creatorTypeLabels[selectedCreatorType] || selectedCreatorType }}</span>
                  </button>
                </div>
              </div>
            </div>


            <div v-if="loadingArtists" class="relative z-10 text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 dark:border-slate-600 border-t-purple-500"></div>
              <p class="mt-4 text-sm text-subtle">{{ strings.loadingShort }}</p>
            </div>

            
            <div v-if="artistsError" class="relative z-10 text-center py-12 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl mb-4">
              <p class="text-red-500 font-bold mb-1">{{ strings.loadingErrorTitle }}</p>
              <p class="text-xs text-red-400 font-mono">{{ artistsError }}</p>
            </div>

            
            <div v-else-if="filteredArtists.length > 0" class="relative z-10 grid gap-3 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <article
                v-for="item in filteredArtists"
                :key="item.id"
                class="group relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"
              >
                
                <div class="h-1.5 w-full bg-gradient-to-r" :class="getArtistsGradient(item)"></div>

                <div class="p-3 sm:p-5 flex-1 flex flex-col gap-2 sm:gap-4">

                  <!-- Creator Type Tag - Top Right -->
                  <div class="flex items-start justify-end -mt-1">
                    <span class="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide border shadow-sm bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600 flex items-center gap-1.5">
                      {{ creatorTypeLabels[item.creator_type] || creatorTypeLabels['画师'] }}
                    </span>
                  </div>

                  <div class="flex flex-row items-start gap-2 sm:gap-4">

                    <div class="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-1 shadow-sm relative overflow-hidden">
                      <div class="absolute inset-0 opacity-10" :class="getArtistsGradient(item)"></div>
                      <img referrerpolicy="no-referrer" v-if="item.avatar" :src="item.avatar" class="w-full h-full object-cover rounded-lg sm:rounded-xl relative z-10" :alt="item.name" loading="lazy" @error="$event.target.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2240%22 fill=%22%2394a3b8%22%3E🎨%3C/text%3E%3C/svg%3E'">
                      <div v-else class="w-full h-full flex items-center justify-center text-lg sm:text-xl text-slate-300 relative z-10 font-bold">
                        {{ item.name.charAt(0).toUpperCase() }}
                      </div>
                    </div>

                    <div class="flex-1 min-w-0 flex flex-col justify-center min-h-[auto] sm:min-h-[3.5rem]">
                      <h3 class="text-sm sm:text-lg font-black text-main-color leading-tight mb-0.5 line-clamp-1">
                        {{ item.name }}
                      </h3>
                    </div>
                  </div>

                  
                  <div v-if="item.note || item.qq_group" class="text-xs text-subtle leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 space-y-1">
                    <div v-if="item.note" class="line-clamp-2">{{ item.note }}</div>
                    <div v-if="item.qq_group" class="font-mono text-[10px] opacity-70">QQ群: {{ item.qq_group }}</div>
                  </div>
                </div>

                
                <div class="grid grid-cols-2 border-t border-slate-100 dark:border-slate-700/50 divide-x divide-slate-100 dark:divide-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                  <button
                    type="button"
                    @click="openArtistPlatform(item)"
                    :disabled="!item.platform_url"
                    class="py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-700 transition flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span>🔗</span>
                    <span>{{ getArtistsPlatformDisplay(item).label }}</span>
                  </button>
                  <button
                    type="button"
                    @click="copyArtistQQ(item)"
                    :disabled="!item.qq_group"
                    class="py-3 text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    :class="artistsCopiedId === item.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-700'"
                  >
                    <span v-if="artistsCopiedId === item.id">✓</span>
                    <span v-else>📋</span>
                    <span class="hidden sm:inline">{{ artistsCopiedId === item.id ? strings.meetupsCopied : strings.copyQQLabel }}</span>
                    <span class="sm:hidden">{{ artistsCopiedId === item.id ? '✓' : strings.qqShort }}</span>
                  </button>
                </div>
              </article>
            </div>

            
            <div v-else class="text-subtle text-sm relative z-10 text-center py-12 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <span class="text-4xl mb-3 opacity-50 block">🎨</span>
              {{ strings.noArtists }}
            </div>
          </div>
        </section>

        

        
        

        


        
        <section
          v-if="activeModule === 'birthdays'"
          class="module-body grid gap-6 lg:grid-cols-[1fr,320px] xl:grid-cols-[1fr,360px]"
        >
          
          <div class="fursuit-module-container relative overflow-hidden rounded-3xl p-4 sm:p-6 !min-h-0 sm:!min-h-[600px] bg-slate-50/50 dark:bg-slate-900/20">
            
            <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-rose-300/20 dark:bg-rose-500/10 blur-[120px] pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-orange-300/20 dark:bg-orange-500/10 blur-[100px] pointer-events-none"></div>

            
            <div class="relative z-10 mb-3 sm:mb-6 space-y-4">
               <div class="flex flex-row items-center justify-between gap-2">
                  
                  <div class="flex items-start gap-2 sm:gap-3">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
                      <span class="text-base sm:text-xl">🎂</span>
                    </div>
                    <div>
                      <h2 class="text-lg sm:text-2xl font-black text-main-color tracking-tight">{{ strings.buttonBirthdays }}</h2>
                       <p class="text-[10px] sm:text-xs font-medium text-subtle">
                        {{ birthdayTitleText }}
                      </p>
                    </div>
                  </div>

                  
                  <div class="flex items-center gap-1 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm shrink-0">
                      <button
                        type="button"
                        @click="changeBirthdayMonth(-1)"
                        class="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:text-rose-500 transition text-subtle"
                        title="上个月"
                      >
                         <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                      </button>
                      
                       <span
                         class="text-xs font-bold text-main-color min-w-[60px] sm:min-w-[80px] text-center font-mono"
                         :class="birthdayAutoJumping ? 'animate-pulse text-rose-500 dark:text-rose-400' : ''"
                       >
                         {{ birthdayCalendar.year }}.{{ birthdayCalendar.month < 10 ? '0' + birthdayCalendar.month : birthdayCalendar.month }}
                       </span>

                      <button
                        type="button"
                        @click="changeBirthdayMonth(1)"
                        class="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:text-rose-500 transition text-subtle"
                        title="下个月"
                      >
                        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                  </div>
               </div>
            </div>

            
            <div class="relative z-10">
                <div class="weekday-header mb-2 bg-white/30 dark:bg-slate-800/30 rounded-xl p-2 border border-white/40 dark:border-slate-700/40">
                  <div v-for="w in birthdayWeekdays" :key="w" class="py-1 text-center font-bold text-xs text-subtle tracking-wide">
                    {{ w }}
                  </div>
                </div>

                <div class="birthday-grid-layout">
                  <div
                    v-for="(cell, idx) in birthdayCalendar.cells"
                    :key="idx"
                    :class="[
                      'birthday-cell',
                      (idx % 7 === 0 || idx % 7 === 6) ? 'birthday-cell--weekend' : '',
                      cell.type === 'day' && cell.users && cell.users.length ? 'birthday-cell--active' : '',
                      cell.isToday ? 'birthday-cell--today' : '',
                      cell.type === 'empty' ? 'birthday-cell--placeholder' : ''
                    ]"
                    @click="cell.type === 'day' && cell.users && cell.users.length ? openBirthdayModal(cell.day, cell.users) : null"
                  >
                    <template v-if="cell.type === 'day'">
                      <div class="flex justify-between items-start px-2 pt-1.5">
                        <span
                          class="text-xs font-semibold font-mono leading-none transition-colors"
                          :class="[
                            cell.isToday ? 'text-rose-600 dark:text-rose-400 scale-110 origin-top-left' : 'text-main-color',
                            (!cell.isToday && (idx % 7 === 0 || idx % 7 === 6)) ? 'text-subtle' : ''
                          ]"
                        >
                          {{ cell.day }}
                        </span>

                        <span v-if="cell.isToday" class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                      </div>

                      <div class="flex-1 flex flex-col items-center justify-center min-h-0 pb-1">
                        <div v-if="cell.users && cell.users.length" class="avatar-stack -space-x-2">
                          <template v-for="(u, uidx) in cell.users.slice(0, isMobile ? 1 : 2)" :key="u.uid">
                            <img referrerpolicy="no-referrer"
                              :src="getAvatarUrl(u)"
 @error="onAvatarError($event, u)"
                              :alt="u.name"
                              class="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover"
                              loading="lazy"
                            />
                          </template>
                          <div
                            v-if="cell.users.length > (isMobile ? 1 : 2)"
                            class="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] font-bold text-subtle"
                          >
                            +{{ cell.users.length - (isMobile ? 1 : 2) }}
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>

                <div
                  v-if="!birthdayProfiles.length || !birthdayCalendarGrouped.size"
                  class="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-subtle mt-4"
                >
                  <div class="text-2xl mb-2">🍃</div>
                  <div class="text-sm text-subtle">{{ strings.birthdaysCalendarEmpty }}</div>
                </div>
            </div>
          </div>

          
          <div class="card-surface-soft px-3 py-4 sm:px-5 sm:py-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 h-fit sticky top-24">
            <div class="relative overflow-hidden group">
              
              <div
                class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"
              ></div>

              <h3
                class="text-lg font-bold text-main-color relative z-10 mb-4 flex items-center gap-2"
              >
                🎉 {{ strings.birthdaysTodayTitle }}
              </h3>

              <div class="relative z-10 space-y-3" v-if="todayBirthdays.length">
                <div
                  v-for="user in todayBirthdays.slice(0, todayMaxList)"
                  :key="user.uid"
                  class="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-800/60 p-2 rounded-xl border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 hover:bg-rose-50/80 dark:hover:bg-slate-700/70 transition cursor-pointer"
                  @click="openProfile(user)"
                >
                  <div class="relative">
                    <img referrerpolicy="no-referrer"
                      :src="getAvatarUrl(user)"
 @error="onAvatarError($event, user)"
                      class="w-10 h-10 rounded-full border border-subtle object-cover"
                      loading="lazy"
                    />
                    <div class="absolute -bottom-1 -right-1 text-xs">
                      🍰
                    </div>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-bold text-main-color truncate">
                      {{ user.name }}
                    </div>
                    <div class="text-xs text-rose-500 dark:text-rose-400 mt-0.5">
                      {{ strings.birthdayGreeting }}
                    </div>
                  </div>
                  <div class="text-subtle opacity-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>

                <div v-if="todayBirthdays.length > todayMaxList" class="text-center text-xs text-subtle pt-2">
                  {{ strings.birthdaysMoreToday.replace('{n}', todayBirthdays.length - todayMaxList) }}
                </div>
              </div>

              <div v-else class="relative z-10 text-center py-6">
                <div class="text-3xl mb-2 opacity-80">🎁</div>
                <div class="text-sm font-medium text-main-color">
                  {{ strings.birthdayEmptyToday }}
                </div>
                <div class="text-xs text-subtle mt-1">
                  {{ strings.birthdayEmptyHint }}
                </div>
              </div>
            </div>
          </div>

          
          <div
            v-if="birthdayModal.open"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 transition-all"
            @click.self="closeBirthdayModal"
          >
            <div
              class="bg-white dark:bg-slate-900 rounded-2xl border border-subtle shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col transform transition-all scale-100"
            >
              <div
                class="flex items-center justify-between px-5 py-4 border-b border-subtle bg-slate-50/50 dark:bg-slate-800/80 rounded-t-2xl"
              >
                <div class="flex flex-col">
                  <span class="text-lg font-bold text-main-color">
                    {{ birthdayModalTitle }}
                  </span>
                </div>
                <button
                  type="button"
                  class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-subtle hover:text-main-color hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  @click="closeBirthdayModal"
                >
                  ✕
                </button>
              </div>

              <div class="overflow-y-auto p-2 sm:p-4 space-y-2">
                <div
                  v-for="user in birthdayModal.users"
                  :key="user.uid"
                  class="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent hover:border-subtle transition cursor-pointer group"
                  @click="openProfile(user)"
                >
                  <img referrerpolicy="no-referrer"
                    :src="getAvatarUrl(user)"
 @error="onAvatarError($event, user)"
                    class="w-12 h-12 rounded-full border border-subtle object-cover shadow-sm group-hover:scale-105 transition"
                    loading="lazy"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="text-base font-bold text-main-color truncate">
                      {{ user.name }}
                    </div>
                    <div class="text-xs text-subtle font-mono">
                      UID {{ user.uid }}
                    </div>
                  </div>
                  <div
                    class="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-subtle group-hover:text-rose-500 transition"
                  >
                    {{ formatNumberValue(user.followers) }} {{ strings.fansLabel }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

    <section
      v-if="activeModule === 'thanks'"
      class="module-body"
    >
      <div class="fursuit-module-container relative overflow-hidden rounded-3xl p-4 sm:p-6 min-h-[600px] bg-slate-50/50 dark:bg-slate-900/20">
        
        <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-yellow-300/20 dark:bg-yellow-500/10 blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-300/20 dark:bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

        
        <div class="relative z-10 mb-6 space-y-4">
          <div class="flex items-center justify-between gap-2 sm:gap-4">
            
            <div class="flex items-start gap-2 sm:gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <span class="text-xl">{{ thanksSubModule === 'thanks' ? '⭐' : '🔗' }}</span>
              </div>
              <div>
                <h2 class="text-2xl font-black text-main-color tracking-tight">{{ thanksSubModule === 'thanks' ? thanksTitle : linksTitle }}</h2>
                 <p class="text-xs font-medium text-subtle">
                  {{ thanksSubModule === 'thanks' ? strings.thanksSubtitle : strings.linksSubtitle }}
                </p>
              </div>
            </div>

            
            <div class="flex items-center gap-1 p-1.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-sm shrink-0">
              <button
                type="button"
                @click="switchThanksSubModule('thanks')"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5"
                :class="thanksSubModule === 'thanks' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700/50'"
              >
                <span>⭐</span>
                <span>{{ thanksTitle }}</span>
              </button>
              <button
                type="button"
                @click="switchThanksSubModule('links')"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5"
                :class="thanksSubModule === 'links' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700/50'"
              >
                <span>🔗</span>
                <span>{{ linksTitle }}</span>
              </button>
            </div>
          </div>
        </div>

        
        <template v-if="thanksSubModule === 'thanks'">
          
          <div v-if="loadingThanks" class="relative z-10 text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 dark:border-slate-600 border-t-amber-500"></div>
            <p class="mt-4 text-sm text-subtle">{{ strings.loadingShort }}</p>
          </div>

          
          <div v-else-if="thanksError" class="relative z-10 text-center py-12 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl mb-4">
             <p class="text-red-500 font-bold mb-1">{{ strings.loadingErrorTitle }}</p>
             <p class="text-xs text-red-400 font-mono">{{ thanksError }}</p>
          </div>

          
          <div v-else-if="filteredThanks.length > 0" class="relative z-10 grid gap-3 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <article
              v-for="item in filteredThanks"
              :key="item.id"
              @click="openThanksItem(item)"
              class="group relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
               
               <div class="h-1.5 w-full bg-gradient-to-r" :class="getThanksGradient(item)"></div>

              <div class="p-3 sm:p-5 flex-1 flex flex-col gap-2 sm:gap-4">
                 
                 <div class="flex items-center justify-between gap-2">
                    <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide border shadow-sm bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600">
                      {{ getThanksPlatformDisplay(item).label }}
                    </span>
                    
                    <span
                      v-if="item.role"
                      class="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide border shadow-sm bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50"
                    >
                      {{ item.role }}
                    </span>
                 </div>

                
                <div class="flex flex-row items-start gap-2 sm:gap-4">
                  
                   <div class="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-1 shadow-sm transition-transform group-hover:scale-105 relative overflow-hidden">
                      <div class="absolute inset-0 opacity-10" :class="getThanksGradient(item)"></div>
                      <img referrerpolicy="no-referrer" v-if="item.cover_image" :src="item.cover_image" class="w-full h-full object-cover rounded-lg sm:rounded-xl relative z-10" :alt="item.name" loading="lazy">
                       <div v-else class="w-full h-full flex items-center justify-center text-lg sm:text-xl text-slate-300 relative z-10 font-bold">
                          {{ item.name.charAt(0).toUpperCase() }}
                       </div>
                   </div>

                   <div class="flex-1 min-w-0 flex flex-col justify-center min-h-[auto] sm:min-h-[3.5rem]">
                      <h3 class="text-sm sm:text-lg font-black text-main-color leading-tight mb-0.5 line-clamp-1 transition-colors group-hover:text-amber-500">
                        {{ item.name }}
                      </h3>
                      <div v-if="item.handle" class="text-xs text-subtle font-mono truncate opacity-70">
                         {{ item.handle }}
                      </div>
                   </div>
                </div>

                
                 <div v-if="item.description" class="text-xs text-subtle leading-relaxed line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    {{ item.description }}
                 </div>
              </div>

              
              <div class="grid grid-cols-1 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                  <button
                    type="button"
                    class="py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-700 transition flex items-center justify-center gap-1 group/btn"
                  >
                     <span v-if="thanksCopiedId === item.id">✓</span>
                     <span v-else-if="item.url">🔗</span>
                     <span v-else>📋</span>
                     <span>{{ thanksCopiedId === item.id ? strings.meetupsCopied : getThanksActionLabel(item) }}</span>
                  </button>
              </div>
            </article>
          </div>

          <div v-else class="text-subtle text-sm relative z-10 text-center py-12 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <span class="text-4xl mb-3 opacity-50 block">🍃</span>
            {{ strings.thanksEmpty }}
          </div>
        </template>

        
        <template v-else-if="thanksSubModule === 'links'">
          
          <div v-if="loadingLinks" class="relative z-10 text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 dark:border-slate-600 border-t-indigo-500"></div>
            <p class="mt-4 text-sm text-subtle">{{ strings.loadingShort }}</p>
          </div>

          
          <div v-else-if="linksError" class="relative z-10 text-center py-12 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl mb-4">
             <p class="text-red-500 font-bold mb-1">{{ strings.loadingErrorTitle }}</p>
             <p class="text-xs text-red-400 font-mono">{{ linksError }}</p>
          </div>

          
          <div v-else-if="filteredLinks.length > 0" class="relative z-10 grid gap-3 sm:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <article
              v-for="link in filteredLinks"
              :key="link.id"
              @click="openLinkItem(link)"
              class="group relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
               
               <div class="h-1.5 w-full bg-gradient-to-r" :class="getLinkGradient(link)"></div>

              <div class="p-3 sm:p-5 flex-1 flex flex-col gap-2 sm:gap-4">
                 
                 <div class="flex items-center justify-between gap-2 h-5">
                    
                 </div>

                
                <div class="flex flex-row items-start gap-2 sm:gap-4">
                  
                   <div class="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-1 shadow-sm transition-transform group-hover:scale-105 relative overflow-hidden">
                      <div class="absolute inset-0 opacity-10" :class="getLinkGradient(link)"></div>
                      <img referrerpolicy="no-referrer" v-if="link.cover_image" :src="link.cover_image" class="w-full h-full object-contain rounded-lg sm:rounded-xl relative z-10" :alt="link.name" loading="lazy" @error="$event.target.style.display='none'">
                       <div v-if="!link.cover_image" class="w-full h-full flex items-center justify-center text-lg sm:text-xl text-slate-300 relative z-10 font-bold">
                          🌐
                       </div>
                   </div>

                   <div class="flex-1 min-w-0 flex flex-col justify-center min-h-[auto] sm:min-h-[3.5rem]">
                      <h3 class="text-sm sm:text-lg font-black text-main-color leading-tight mb-0.5 line-clamp-2 transition-colors group-hover:text-indigo-500">
                        {{ link.name }}
                      </h3>
                   </div>
                </div>
                
                 
                 <div v-if="link.description" class="hidden sm:block text-xs text-subtle leading-relaxed line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    {{ link.description }}
                 </div>
              </div>

              
              <div class="grid grid-cols-1 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                  <button
                    type="button"
                    class="py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition flex items-center justify-center gap-1 group/btn"
                  >
                     <span>🔗</span>
                     <span>{{ strings.visitSite }}</span>
                     <span class="transition-transform group-hover/btn:translate-x-0.5">→</span>
                  </button>
              </div>
            </article>
          </div>

          <div v-else class="text-subtle text-sm relative z-10 text-center py-12 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <span class="text-4xl mb-3 opacity-50 block">🔗</span>
            {{ strings.linksEmpty }}
          </div>
        </template>
      </div>
    </section>

      </div>

    
    <footer class="mt-12 text-xs text-subtle text-center space-y-2 border-t border-subtle pt-6 pb-4">
      <p>
        {{ strings.footerPrimary }}
      </p>
      <p class="text-[11px] text-slate-500">
        {{ strings.footerCTA }}
        <a
          class="underline"
          href="https://space.bilibili.com/108736539"
          target="_blank"
          rel="noopener"
          >{{ strings.bilibiliProfile }}</a
        >
      </p>
      <p v-if="shouldShowIcp" class="text-[10px] text-slate-400 dark:text-slate-600 mt-2">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-slate-600 dark:hover:text-slate-400 transition-colors underline decoration-dotted underline-offset-2"
        >
          {{ icpNumber }}
        </a>
      </p>
      <p class="text-[10px] text-slate-400 dark:text-slate-600 mt-3 leading-relaxed">
        {{ strings.disclaimer }}
      </p>
      
    </footer>


    <div class="fixed bottom-8 right-8 z-40 flex flex-col gap-3">
        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
            <button
              v-show="showBackToTop"
              type="button"
              class="h-14 w-14 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 shadow-xl shadow-black/10 hover:bg-white hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 hover:scale-105 active:scale-95 transition-all duration-300 group"
              @click="scrollToTop"
              aria-label="回到顶部"
            >
              <svg class="w-7 h-7 transition-transform group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7" />
              </svg>
            </button>
        </transition>
    </div>
  </div>
`;
