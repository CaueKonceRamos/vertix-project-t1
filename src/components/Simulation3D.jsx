import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FBX_MODEL_PATHS, getFBXScale } from '../utils/fbxModels'
import '../styles/Simulation3D.css'

export default function Simulation3D({ objects, connections }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const modelGroupRef = useRef(null)
  const loadedModelsRef = useRef({})
  const animationIdRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0f1f)
    sceneRef.current = scene

    const width = container.clientWidth
    const height = container.clientHeight
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(15, 10, 20)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(15, 20, 15)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.far = 100
    directionalLight.shadow.camera.left = -30
    directionalLight.shadow.camera.right = 30
    directionalLight.shadow.camera.top = 30
    directionalLight.shadow.camera.bottom = -30
    scene.add(directionalLight)

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5)
    fillLight.position.set(-15, 8, -15)
    scene.add(fillLight)

    const gridHelper = new THREE.GridHelper(40, 40, 0x444444, 0x222222)
    gridHelper.position.y = 0.01
    scene.add(gridHelper)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x0a0f1f, roughness: 1 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.autoRotate = false
    controls.minDistance = 5
    controls.maxDistance = 100
    controls.target.set(0, 2, 0)
    controls.update()
    controlsRef.current = controls

    const modelGroup = new THREE.Group()
    scene.add(modelGroup)
    modelGroupRef.current = modelGroup

    const onResize = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    const animate = () => {
      const delta = clock.getDelta()
      controls.update()
      renderer.render(scene, camera)
      animationIdRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      renderer.dispose()
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    const scene = sceneRef.current
    const modelGroup = modelGroupRef.current
    if (!scene || !modelGroup) return

    modelGroup.clear()

    const loader = new FBXLoader()
    const loadedModels = loadedModelsRef.current

    const createPlaceholder = (type) => {
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x2563eb, 
        emissive: 0x0f1729,
        metalness: 0.2,
        roughness: 0.6
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      return mesh
    }

    if (!objects || objects.length === 0) {
      console.log('Nenhum objeto para carregar')
      return
    }

    console.log(`Carregando ${objects.length} objetos`)

    objects.forEach((object, index) => {
      const modelPath = FBX_MODEL_PATHS[object.type]
      const positionX = (object.position.x - 320) / 15
      const positionZ = (object.position.y - 180) / 15
      const scale = getFBXScale(object.type)

      console.log(`Objeto ${index}: ${object.type} em (${positionX.toFixed(2)}, ${positionZ.toFixed(2)})`)

      if (modelPath && loadedModels[object.type]) {
        try {
          const model = loadedModels[object.type].clone(true)
          model.traverse(child => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          model.scale.set(scale, scale, scale)
          model.position.set(positionX, 0.5, positionZ)
          model.rotation.order = 'YXZ'
          modelGroup.add(model)
          console.log(`✓ Modelo clonado: ${object.type}`)
        } catch (error) {
          console.error(`Erro ao clonar modelo ${object.type}:`, error)
          const fallback = createPlaceholder(object.type)
          fallback.position.set(positionX, 0.5, positionZ)
          modelGroup.add(fallback)
        }
      } else if (modelPath) {
        loader.load(
          modelPath,
          (fbx) => {
            console.log(`✓ Carregado FBX: ${object.type}`)
            loadedModels[object.type] = fbx
            const model = fbx.clone(true)
            model.traverse(child => {
              if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
              }
            })
            model.scale.set(scale, scale, scale)
            model.position.set(positionX, 0.5, positionZ)
            modelGroup.add(model)
          },
          (progress) => {
            const percent = Math.round(progress.loaded / progress.total * 100)
            console.log(`Carregando ${object.type}: ${percent}%`)
          },
          (error) => {
            console.warn(`Erro ao carregar FBX de '${object.type}':`, error)
            const fallback = createPlaceholder(object.type)
            fallback.position.set(positionX, 0.5, positionZ)
            modelGroup.add(fallback)
          }
        )
      } else {
        console.log(`Sem modelo para: ${object.type}, usando placeholder`)
        const fallback = createPlaceholder(object.type)
        fallback.position.set(positionX, 0.5, positionZ)
        modelGroup.add(fallback)
      }
    })
  }, [objects])

  return (
    <div className="simulation-3d-container" ref={containerRef} />
  )
}
