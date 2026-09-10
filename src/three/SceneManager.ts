import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export class SceneManager {
    public scene: THREE.Scene
    public camera: THREE.PerspectiveCamera
    public renderer: THREE.WebGLRenderer
    public labelRenderer: CSS2DRenderer
    public controls: OrbitControls
    // @ts-ignore
    public composer: EffectComposer
    // @ts-ignore
    public bloomPass: UnrealBloomPass

    private container: HTMLElement
    private animationId = 0

    public deviceMeshes: Map<string, THREE.Object3D> = new Map()
    public raycaster = new THREE.Raycaster()
    public mouse = new THREE.Vector2()

    public houseModel: THREE.Group | null = null
    public houseBox = new THREE.Box3()

    constructor(container: HTMLElement) {
        this.container = container

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x0f172a)

        const { clientWidth: w, clientHeight: h } = container
        this.camera = new THREE.PerspectiveCamera(45, w / h || 1, 0.1, 2000)
        this.camera.position.set(12, 14, 12)

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        this.renderer.setSize(w, h)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1.1
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        container.appendChild(this.renderer.domElement)

        this.labelRenderer = new CSS2DRenderer()
        this.labelRenderer.setSize(w, h)
        this.labelRenderer.domElement.style.position = 'absolute'
        this.labelRenderer.domElement.style.top = '0'
        this.labelRenderer.domElement.style.left = '0'
        this.labelRenderer.domElement.style.pointerEvents = 'none'
        container.appendChild(this.labelRenderer.domElement)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.08
        this.controls.maxPolarAngle = Math.PI / 2.05
        this.controls.minDistance = 2
        this.controls.maxDistance = 60
        this.controls.target.set(0, 1.5, 0)
        this.controls.update()

        this.initLights()
        this.initGround()
        this.initPostProcessing()

        window.addEventListener('resize', this.onResize)
        this.renderer.domElement.addEventListener('click', this.onClick)

        this.animate()
    }

    private initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.75)
        this.scene.add(ambient)

        const dir = new THREE.DirectionalLight(0xffffff, 1.25)
        dir.position.set(12, 20, 10)
        dir.castShadow = true
        dir.shadow.mapSize.set(2048, 2048)
        dir.shadow.bias = -0.0001
        this.scene.add(dir)

        const fill = new THREE.DirectionalLight(0x93c5fd, 0.35)
        fill.position.set(-10, 10, -8)
        this.scene.add(fill)
    }

    private initGround() {
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(60, 60),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
        )
        ground.rotation.x = -Math.PI / 2
        ground.position.y = 0
        ground.receiveShadow = true
        this.scene.add(ground)

        const grid = new THREE.GridHelper(60, 60, 0x334155, 0x1e293b)
        grid.position.y = 0.01
        this.scene.add(grid)
    }

    private initPostProcessing() {
        const { clientWidth: w, clientHeight: h } = this.container
        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))

        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.65, 0.35, 0.78)
        this.composer.addPass(this.bloomPass)
    }

    /**
     * 加载户型模型（修复压缩贴地问题）
     */
    async loadHouse(url: string) {
        const loader = new GLTFLoader()
        const draco = new DRACOLoader()
        draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
        loader.setDRACOLoader(draco)

        console.log('开始加载模型:', url)
        const gltf = await loader.loadAsync(url)
        const model = gltf.scene

        // ========== 关键修复逻辑 ==========
        // 1. 先强制更新一次矩阵
        model.updateMatrixWorld(true)

        // 2. 计算原始包围盒
        const box = new THREE.Box3().setFromObject(model)
        const size = new THREE.Vector3()
        const center = new THREE.Vector3()
        box.getSize(size)
        box.getCenter(center)

        console.log('模型原始尺寸 (x,y,z):', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2))

        // 3. 计算统一缩放比例（以最长边为基准，目标约 12~14 米）
        const maxDim = Math.max(size.x, size.y, size.z)
        const targetSize = 13
        const scale = maxDim > 0 ? targetSize / maxDim : 1

        console.log('应用缩放比例:', scale.toFixed(4))

        // 4. 应用缩放
        model.scale.set(scale, scale, scale)

        // 5. 【最关键】缩放后必须重新更新世界矩阵
        model.updateMatrixWorld(true)

        // 6. 重新计算缩放后的包围盒
        box.setFromObject(model)
        box.getSize(size)
        box.getCenter(center)

        console.log('缩放后尺寸:', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2))
        console.log('缩放后中心:', center.x.toFixed(2), center.y.toFixed(2), center.z.toFixed(2))
        console.log('缩放后 min.y:', box.min.y.toFixed(2))

        // 7. 正确居中 + 贴地（只改 position，不破坏缩放）
        model.position.x = -center.x
        model.position.z = -center.z
        model.position.y = -box.min.y   // 让模型底部正好落在 y=0

        // 8. 再次更新矩阵
        model.updateMatrixWorld(true)

        // 9. 处理材质
        model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh
                mesh.castShadow = true
                mesh.receiveShadow = true

                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
                materials.forEach((mat: any) => {
                    if (mat && mat.map) {
                        mat.map.colorSpace = THREE.SRGBColorSpace
                    }
                    if (mat) {
                        mat.side = THREE.FrontSide
                    }
                })
            }
        })

        this.scene.add(model)
        this.houseModel = model

        // 最终包围盒
        this.houseBox.setFromObject(model)
        console.log('最终模型位置:', model.position)
        console.log('最终包围盒 min/max:', this.houseBox.min, this.houseBox.max)

        // 自动调整相机
        this.fitCameraToModel()

        return model
    }

    private fitCameraToModel() {
        if (!this.houseModel) return

        const size = this.houseBox.getSize(new THREE.Vector3())
        const center = this.houseBox.getCenter(new THREE.Vector3())

        const maxDim = Math.max(size.x, size.z, 1)
        const distance = maxDim * 1.35

        this.camera.position.set(
            center.x + distance * 0.75,
            Math.max(size.y * 1.8, 8),
            center.z + distance * 0.75
        )
        this.controls.target.set(center.x, size.y * 0.35, center.z)
        this.controls.update()
    }

    /**
     * 根据当前模型位置放置设备
     */
    placeDevicesRelativeToHouse() {
        if (!this.houseModel) return

        // 先清除旧设备
        this.deviceMeshes.forEach((mesh) => {
            this.scene.remove(mesh)
        })
        this.deviceMeshes.clear()

        const center = this.houseBox.getCenter(new THREE.Vector3())
        const size = this.houseBox.getSize(new THREE.Vector3())

        // 客厅主灯
        this.addDevice(
            'light_living',
            new THREE.Vector3(
                center.x + size.x * 0.22,
                size.y * 0.82,
                center.z + size.z * 0.08
            ),
            '客厅主灯',
            0xffaa00
        )

        // 主卧灯
        this.addDevice(
            'light_bedroom',
            new THREE.Vector3(
                center.x - size.x * 0.28,
                size.y * 0.82,
                center.z - size.z * 0.18
            ),
            '主卧灯',
            0x66ccff
        )
    }

    addDevice(id: string, position: THREE.Vector3, name: string, color = 0xffaa00) {
        const geo = new THREE.SphereGeometry(0.22, 32, 32)
        const mat = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 1.7,
            metalness: 0.1,
            roughness: 0.25
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.copy(position)
        mesh.castShadow = true
        mesh.userData = { id, name, type: 'device' }
        this.scene.add(mesh)
        this.deviceMeshes.set(id, mesh)

        const div = document.createElement('div')
        div.className = 'device-label'
        div.textContent = name
        div.style.cssText = `
      color: #fff;
      font-size: 13px;
      background: rgba(15, 23, 42, 0.9);
      padding: 3px 10px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      border: 1px solid rgba(255,255,255,0.12);
    `
        const label = new CSS2DObject(div)
        label.position.set(0, 0.4, 0)
        mesh.add(label)

        return mesh
    }

    updateDeviceState(id: string, isOn: boolean, brightness = 1) {
        const mesh = this.deviceMeshes.get(id)
        if (!mesh || !(mesh instanceof THREE.Mesh)) return

        const mat = mesh.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = isOn ? 0.95 + brightness * 1.35 : 0.12
        mat.needsUpdate = true
    }

    private onClick = (event: MouseEvent) => {
        const rect = this.renderer.domElement.getBoundingClientRect()
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        this.raycaster.setFromCamera(this.mouse, this.camera)
        const intersects = this.raycaster.intersectObjects(Array.from(this.deviceMeshes.values()))

        if (intersects.length > 0) {
            // @ts-ignore
            const obj = intersects[0].object
            const { id, name } = obj.userData
            this.container.dispatchEvent(
                new CustomEvent('device-click', { detail: { id, name, object: obj } })
            )
        }
    }

    private onResize = () => {
        const { clientWidth: w, clientHeight: h } = this.container
        if (w === 0 || h === 0) return

        this.camera.aspect = w / h
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(w, h)
        this.labelRenderer.setSize(w, h)
        this.composer.setSize(w, h)
        this.bloomPass.resolution.set(w, h)
    }

    private animate = () => {
        this.animationId = requestAnimationFrame(this.animate)
        this.controls.update()
        this.composer.render()
        this.labelRenderer.render(this.scene, this.camera)
    }

    dispose() {
        cancelAnimationFrame(this.animationId)
        window.removeEventListener('resize', this.onResize)
        this.renderer.domElement.removeEventListener('click', this.onClick)
        this.controls.dispose()
        this.renderer.dispose()
        this.container.innerHTML = ''
    }
}