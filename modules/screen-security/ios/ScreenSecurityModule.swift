import ExpoModulesCore
import LocalAuthentication
import UIKit

public class ScreenSecurityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ScreenSecurity")
    Events("onScreenshotTaken")

    AsyncFunction("getDeviceId") { () throws -> String in
      guard let identifier = UIDevice.current.identifierForVendor?.uuidString else {
        throw NSError(
          domain: "ScreenSecurity",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "The vendor device identifier is unavailable"]
        )
      }
      return identifier
    }

    AsyncFunction("isBiometricAuthenticated") { () async throws -> Bool in
      let context = LAContext()
      var error: NSError?
      guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
        throw Self.biometricError(for: error)
      }

      do {
        return try await context.evaluatePolicy(
          .deviceOwnerAuthenticationWithBiometrics,
          localizedReason: "Authenticate to confirm this payout"
        )
      } catch let error as LAError {
        switch error.code {
        case .userCancel, .systemCancel, .appCancel, .userFallback, .authenticationFailed:
          return false
        case .biometryNotEnrolled:
          throw Self.makeBiometricError(
            "ERR_BIOMETRIC_NOT_ENROLLED",
            "No biometrics are enrolled on this device"
          )
        case .biometryNotAvailable, .passcodeNotSet:
          throw Self.makeBiometricError(
            "ERR_BIOMETRIC_NOT_AVAILABLE",
            "Biometric authentication is unavailable on this device"
          )
        case .biometryLockout:
          throw Self.makeBiometricError(
            "ERR_BIOMETRIC_LOCKED_OUT",
            "Biometric authentication is locked. Try again later."
          )
        default:
          throw Self.makeBiometricError(
            "ERR_BIOMETRIC_UNKNOWN",
            "Biometric authentication failed"
          )
        }
      } catch {
        throw Self.makeBiometricError(
          "ERR_BIOMETRIC_UNKNOWN",
          "Biometric authentication failed"
        )
      }
    }

    OnStartObserving {
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.onScreenshotTaken),
        name: UIApplication.userDidTakeScreenshotNotification,
        object: nil
      )
    }

    OnStopObserving {
      NotificationCenter.default.removeObserver(
        self,
        name: UIApplication.userDidTakeScreenshotNotification,
        object: nil
      )
    }
  }

  @objc private func onScreenshotTaken() {
    sendEvent("onScreenshotTaken")
  }

  private static func biometricError(for error: NSError?) -> Exception {
    guard let error = error as? LAError else {
      return makeBiometricError("ERR_BIOMETRIC_UNKNOWN", "Biometric authentication failed")
    }

    switch error.code {
    case .biometryNotEnrolled:
      return makeBiometricError(
        "ERR_BIOMETRIC_NOT_ENROLLED",
        "No biometrics are enrolled on this device"
      )
    case .biometryNotAvailable, .passcodeNotSet:
      return makeBiometricError(
        "ERR_BIOMETRIC_NOT_AVAILABLE",
        "Biometric authentication is unavailable on this device"
      )
    case .biometryLockout:
      return makeBiometricError(
        "ERR_BIOMETRIC_LOCKED_OUT",
        "Biometric authentication is locked. Try again later."
      )
    default:
      return makeBiometricError("ERR_BIOMETRIC_UNKNOWN", "Biometric authentication failed")
    }
  }

  private static func makeBiometricError(_ code: String, _ message: String) -> Exception {
    Exception(name: code, description: message, code: code)
  }
}
