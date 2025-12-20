import Swal from 'sweetalert2'

// Toast configuration for non-intrusive notifications
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  }
})

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    const { status, title, text } = message.payload

    Toast.fire({
      icon: status === 'success' ? 'success' : status === 'error' ? 'error' : 'info',
      title: title,
      text: text
    })

    sendResponse({ received: true })
  }
  return true
})

console.log('[TabOrange] Content script loaded')
