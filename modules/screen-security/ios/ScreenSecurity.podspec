Pod::Spec.new do |s|
  s.name           = 'ScreenSecurity'
  s.version        = '1.0.0'
  s.summary        = 'Native device identity, biometric authentication, and screenshot events.'
  s.description    = 'A local Expo module for payout security.'
  s.author         = 'Merchant Payout App'
  s.homepage       = 'https://example.invalid'
  s.license        = { :type => 'MIT' }
  s.platforms      = { :ios => '15.0' }
  s.source         = { :git => 'https://example.invalid/ScreenSecurity.git', :tag => s.version.to_s }
  s.source_files   = '**/*.{h,m,mm,swift}'
  s.swift_version  = '5.9'
  s.dependency 'ExpoModulesCore'
end
