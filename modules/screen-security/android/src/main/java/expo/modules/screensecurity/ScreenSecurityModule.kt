package expo.modules.screensecurity

import android.app.Activity
import android.hardware.biometrics.BiometricManager
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.os.CancellationSignal
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.Executor

class ScreenSecurityModule : Module() {
  private var screenshotCallback: Activity.ScreenCaptureCallback? = null
  private var screenshotActivity: Activity? = null

  override fun definition() = ModuleDefinition {
    Name("ScreenSecurity")
    Events("onScreenshotTaken")

    AsyncFunction("getDeviceId") {
      val context = appContext.reactContext
        ?: throw IllegalStateException("Android context is unavailable")
      Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
        ?: throw IllegalStateException("Android device ID is unavailable")
    }

    AsyncFunction("isBiometricAuthenticated") { promise: Promise ->
      val activity = appContext.currentActivity
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P || activity == null) {
        promise.reject(
          "ERR_BIOMETRIC_NOT_AVAILABLE",
          "Biometric authentication is unavailable on this device",
          null
        )
        return@AsyncFunction
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        val biometricManager = activity.getSystemService(BiometricManager::class.java)
        when (biometricManager?.canAuthenticate()) {
          BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
            promise.reject(
              "ERR_BIOMETRIC_NOT_ENROLLED",
              "No biometrics are enrolled on this device",
              null
            )
            return@AsyncFunction
          }
          BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE,
          BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> {
            promise.reject(
              "ERR_BIOMETRIC_NOT_AVAILABLE",
              "Biometric authentication is unavailable on this device",
              null
            )
            return@AsyncFunction
          }
          BiometricManager.BIOMETRIC_SUCCESS -> Unit
          else -> {
            promise.reject(
              "ERR_BIOMETRIC_UNKNOWN",
              "Biometric authentication could not be started",
              null
            )
            return@AsyncFunction
          }
        }
      }

      val executor: Executor = activity.mainExecutor

      try {
        val prompt = BiometricPrompt.Builder(activity)
          .setTitle("Verify payout")
          .setNegativeButton("Cancel", executor) { _, _ -> promise.resolve(false) }
          .build()
        prompt.authenticate(
          CancellationSignal(),
          executor,
          object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult?) {
              promise.resolve(true)
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence?) {
              when (errorCode) {
                BiometricPrompt.BIOMETRIC_ERROR_USER_CANCELED,
                BiometricPrompt.BIOMETRIC_ERROR_CANCELED -> promise.resolve(false)
                BiometricPrompt.BIOMETRIC_ERROR_LOCKOUT,
                BiometricPrompt.BIOMETRIC_ERROR_LOCKOUT_PERMANENT -> promise.reject(
                  "ERR_BIOMETRIC_LOCKED_OUT",
                  "Biometric authentication is locked. Try again later.",
                  null
                )
                BiometricPrompt.BIOMETRIC_ERROR_NO_BIOMETRICS -> promise.reject(
                  "ERR_BIOMETRIC_NOT_ENROLLED",
                  "No biometrics are enrolled on this device",
                  null
                )
                BiometricPrompt.BIOMETRIC_ERROR_HW_NOT_PRESENT,
                BiometricPrompt.BIOMETRIC_ERROR_HW_UNAVAILABLE -> promise.reject(
                  "ERR_BIOMETRIC_NOT_AVAILABLE",
                  "Biometric authentication is unavailable on this device",
                  null
                )
                else -> promise.reject(
                  "ERR_BIOMETRIC_UNKNOWN",
                  errString?.toString() ?: "Biometric authentication failed",
                  null
                )
              }
            }
          }
        )
      } catch (_: Exception) {
        promise.reject(
          "ERR_BIOMETRIC_UNKNOWN",
          "Biometric authentication could not be started",
          null
        )
      }
    }

    OnStartObserving {
      if (Build.VERSION.SDK_INT >= 34) {
        val activity = appContext.currentActivity ?: return@OnStartObserving
        screenshotActivity?.let { previousActivity ->
          screenshotCallback?.let(previousActivity::unregisterScreenCaptureCallback)
        }
        val callback = Activity.ScreenCaptureCallback {
          sendEvent("onScreenshotTaken")
        }
        screenshotActivity = activity
        screenshotCallback = callback
        activity.registerScreenCaptureCallback(activity.mainExecutor, callback)
      }
    }

    OnStopObserving {
      if (Build.VERSION.SDK_INT >= 34) {
        val activity = screenshotActivity
        val callback = screenshotCallback
        if (activity != null && callback != null) {
          activity.unregisterScreenCaptureCallback(callback)
        }
        screenshotActivity = null
        screenshotCallback = null
      }
    }
  }
}
