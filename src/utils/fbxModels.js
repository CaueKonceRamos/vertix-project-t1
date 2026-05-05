export const FBX_MODEL_PATHS = {
  arduino: '/models/arduino_uno.fbx',
  protoboard: '/models/protoboard.fbx',
  jumper: '/models/jumper_wires.fbx',
  resistor: '/models/resistor.fbx',
  led: '/models/led.fbx',
  buzzer: '/models/buzzer.fbx',
  servo: '/models/servo_motor.fbx',
  ultrasonic: '/models/sersor_hc-sr04.fbx',
  ldr: '/models/ldr.fbx',
  button: '/models/botao_push_button.fbx',
  lcd: '/models/display_lcd.fbx',
  esp32: '/models/esp32.fbx'
}

export const getFBXScale = (type) => {
  switch (type) {
    case 'arduino':
    case 'esp32':
      return 0.05
    case 'protoboard':
      return 0.08
    case 'jumper':
      return 0.04
    case 'resistor':
    case 'led':
    case 'button':
    case 'ldr':
      return 0.05
    case 'buzzer':
      return 0.06
    case 'servo':
    case 'ultrasonic':
      return 0.05
    case 'lcd':
      return 0.04
    default:
      return 0.05
  }
}
