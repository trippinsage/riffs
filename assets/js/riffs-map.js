// assets/js/riffs-map.js
// Store map, pins, info panel, and location list
// Proudly family-owned in Newfoundland & Labrador since 1939

import { stores } from "./store-data.js";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const select = document.getElementById("store-select");
  const mapDiv = document.getElementById("store-map");
  const infoDiv = document.getElementById("store-info");
  const loadingDiv = document.getElementById("map-loading");
  const locationsList = document.getElementById("locations-list");
  const touchOverlay = document.getElementById("map-touch-overlay");
  const showAllBtn = document.getElementById("show-all-stores");
  const useLocationBtn = document.getElementById("use-my-location");

  if (!select || !mapDiv || !infoDiv || !loadingDiv || typeof L === "undefined") {
    return;
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function getTelHref(phone) {
    return "tel:" + phone.replace(/[^+\d]/g, "");
  }

  function createDirectionsLink(store, className) {
    const link = createElement("a", className, "View on Google Maps");
    link.href = store.google;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "w-3.5 h-3.5");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("d", "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14");

    icon.appendChild(path);
    link.appendChild(icon);
    return link;
  }

  function createLocationCard(store) {
    const card = createElement("div", "bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-brand/30 transition text-center");
    const title = createElement("h3", "text-lg font-bold text-brand mb-1", store.name.replace("Riff's ", ""));
    const address = createElement("p", "text-gray-600 text-sm mb-1 leading-relaxed", store.address);
    const phoneWrap = createElement("p", "mb-3");
    const phoneLink = createElement("a", "text-gray-800 font-semibold text-sm hover:text-brand", store.phone);
    const mapLink = createDirectionsLink(store, "text-brand hover:text-brand-dark font-semibold text-sm inline-flex items-center gap-1");

    phoneLink.href = getTelHref(store.phone);
    phoneWrap.appendChild(phoneLink);
    card.append(title, address, phoneWrap, mapLink);
    return card;
  }

  /* ---------------------------------------------------------
     POPULATE DROPDOWN
  --------------------------------------------------------- */
  stores.forEach((store, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = store.name;
    select.appendChild(opt);
  });

  /* ---------------------------------------------------------
     POPULATE COLLAPSIBLE LOCATION LIST
  --------------------------------------------------------- */
  if (locationsList) {
    locationsList.textContent = "";
    stores.forEach(store => {
      locationsList.appendChild(createLocationCard(store));
    });

    document.dispatchEvent(new CustomEvent("riffs:locations-populated"));
  }

  /* ---------------------------------------------------------
     INIT MAP - scroll/touch disabled until user clicks the map
  --------------------------------------------------------- */
  const map = L.map(mapDiv, {
    zoomControl: true,
    scrollWheelZoom: false,
    dragging: !L.Browser.mobile,
    touchZoom: false
  });

  const provinceBounds = L.latLngBounds(stores.map(store => [store.coords.lat, store.coords.lng]));

  function fitAllStores() {
    map.fitBounds(provinceBounds, {
      padding: [36, 36],
      maxZoom: 7
    });
  }

  fitAllStores();

  function enableMapInteraction() {
    map.scrollWheelZoom.enable();
    map.touchZoom.enable();
    if (L.Browser.mobile) map.dragging.enable();
    if (touchOverlay) touchOverlay.style.display = "none";
  }

  // Enable full interaction only after user chooses to interact with the map.
  mapDiv.addEventListener("click", enableMapInteraction);

  touchOverlay?.addEventListener("click", enableMapInteraction);

  // Disable scroll zoom again when mouse leaves the map
  mapDiv.addEventListener("mouseleave", () => {
    map.scrollWheelZoom.disable();
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
  }).addTo(map);

  /* ---------------------------------------------------------
     CUSTOM RED PIN
  --------------------------------------------------------- */
  const redIcon = L.divIcon({
    className: "custom-riff-marker",
    html: `
      <svg width="32" height="32" viewBox="0 0 24 24" tabindex="0" aria-label="Store marker">
        <circle cx="12" cy="12" r="9" fill="#EB1B21" stroke="white" stroke-width="3"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  let markers = [];
  let activeMarker = null;
  let userMarker = null;

  /* ---------------------------------------------------------
     ADD MARKERS
  --------------------------------------------------------- */
  stores.forEach((store, i) => {
    const marker = L.marker([store.coords.lat, store.coords.lng], { icon: redIcon })
      .addTo(map);

    marker.on("click", () => {
      select.value = i;
      showStoreInfo(i);
      marker._icon?.classList.add("active");
      setTimeout(() => marker._icon?.classList.remove("active"), 900);
    });

    // Keyboard accessibility for markers
    marker.on("keypress", (e) => {
      if (e.originalEvent.key === "Enter" || e.originalEvent.key === " ") {
        select.value = i;
        showStoreInfo(i);
        marker._icon?.classList.add("active");
        setTimeout(() => marker._icon?.classList.remove("active"), 900);
      }
    });

    marker.on("mouseover", () => {
      marker._icon?.classList.add("active");
    });
    marker.on("mouseout", () => {
      marker._icon?.classList.remove("active");
    });

    markers.push(marker);
  });

  /* ---------------------------------------------------------
     SHOW STORE INFO BELOW MAP
  --------------------------------------------------------- */
  function showStoreInfo(i) {
    const store = stores[i];
    const marker = markers[i];
    if (!store || !marker) return;

    const telHref = getTelHref(store.phone);

    map.flyTo([store.coords.lat, store.coords.lng], 13, { duration: 1.1 });

    // highlight marker
    if (activeMarker) activeMarker.setZIndexOffset(0);
    activeMarker = marker;
    marker.setZIndexOffset(1000);

    infoDiv.textContent = "";

    const inner = createElement("div", "store-info-inner");
    const title = createElement("h3", "", store.name);
    const details = createElement("div", "store-detail-grid");

    const address = createElement("p");
    address.append(
      createElement("strong", "store-detail-label", "Address"),
      document.createTextNode(store.address)
    );

    const phone = createElement("p");
    const phoneLink = createElement("a", "font-semibold text-brand hover:underline", store.phone);
    phoneLink.href = telHref;
    phone.append(createElement("strong", "store-detail-label", "Phone"), phoneLink);

    const actions = createElement("div", "store-info-actions");
    const directions = createElement("a", "", "Get Directions");
    directions.href = store.google;
    directions.target = "_blank";
    directions.rel = "noopener noreferrer";

    const callStore = createElement("a", "", "Call Store");
    callStore.href = telHref;

    details.append(address, phone);
    actions.append(directions, callStore);
    inner.append(title, details, actions);
    infoDiv.appendChild(inner);

    infoDiv.classList.remove("hidden");

    if (window.innerWidth < 768) {
      infoDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /* ---------------------------------------------------------
     DROPDOWN CONTROL
  --------------------------------------------------------- */
  select.addEventListener("change", () => {
    const val = select.value;

    if (val === "") {
      infoDiv.classList.add("hidden");
      fitAllStores();

      if (activeMarker) activeMarker.setZIndexOffset(0);
      activeMarker = null;
    } else {
      showStoreInfo(Number(val));
      if (markers[Number(val)] && markers[Number(val)]._icon) {
        markers[Number(val)]._icon.classList.add("active");
        setTimeout(() => markers[Number(val)]._icon.classList.remove("active"), 900);
      }
    }
  });

  showAllBtn?.addEventListener("click", () => {
    select.value = "";
    infoDiv.classList.add("hidden");
    if (activeMarker) activeMarker.setZIndexOffset(0);
    activeMarker = null;
    fitAllStores();
    map.closePopup();
  });

  useLocationBtn?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showMapStatus("Location is not available in this browser.");
      return;
    }

    useLocationBtn.disabled = true;
    useLocationBtn.textContent = "Locating";

    navigator.geolocation.getCurrentPosition(
      position => {
        const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
        const nearest = stores
          .map((store, index) => ({
            index,
            distance: userLatLng.distanceTo([store.coords.lat, store.coords.lng])
          }))
          .sort((a, b) => a.distance - b.distance)[0];

        if (userMarker) userMarker.remove();
        userMarker = L.circleMarker(userLatLng, {
          radius: 8,
          color: "#10234a",
          weight: 3,
          fillColor: "#ffffff",
          fillOpacity: 1
        }).addTo(map);

        if (nearest) {
          select.value = nearest.index;
          showStoreInfo(nearest.index);
          showMapStatus(`Nearest store: ${stores[nearest.index].name}.`);
        }

        useLocationBtn.disabled = false;
        useLocationBtn.textContent = "Use My Location";
      },
      () => {
        showMapStatus("We could not access your location. You can still choose a store from the list.");
        useLocationBtn.disabled = false;
        useLocationBtn.textContent = "Use My Location";
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  });

  function showMapStatus(message) {
    let status = document.getElementById("map-status");
    if (!status) {
      status = document.createElement("p");
      status.id = "map-status";
      status.className = "map-status";
      mapDiv.parentElement?.appendChild(status);
    }
    status.textContent = message;
  }

  /* ---------------------------------------------------------
     HIDE LOADING OVERLAY
  --------------------------------------------------------- */
  map.whenReady(() => {
    loadingDiv.style.opacity = "0";
    setTimeout(() => (loadingDiv.style.display = "none"), 500);
  });
});
