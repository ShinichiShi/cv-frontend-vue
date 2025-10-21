import { TestbenchData } from '../testbench'

export interface Node {
    type: number
    parent: any
    delete: () => void
}

export interface CircuitElement {
    objectType: string
    x: number
    y: number
    label: string
    labelDirection: string
    propagationDelay: number
    fixDirection: () => void
    [key: string]: any
}

export interface CustomData {
    constructorParamaters?: any[]
    values?: Record<string, any>
    nodes?: Record<string, any>
}

export interface ModuleData {
    objectType: string
    x: number
    y: number
    label: string
    labelDirection?: string
    propagationDelay?: number
    customData: CustomData
    subcircuitMetadata?: any
}

export interface LayoutProperties {
    x: number
    y: number
    id: string
}

export interface Layout {
    width: number
    height: number
    title_x: number
    title_y: number
    titleEnabled?: boolean
}

export interface VerilogMetadata {
    isVerilogCircuit: boolean
    isMainCircuit: boolean
    [key: string]: any
}

export interface ScopeData {
    name?: string
    id: string
    restrictedCircuitElementsUsed: any[]
    allNodes: any[]
    verilogMetadata?: VerilogMetadata
    testbenchData?: any
    layout?: Layout
    [key: string]: any
}

export interface Scope {
    restrictedCircuitElementsUsed: any[]
    allNodes: Node[]
    wires: any[]
    verilogMetadata?: VerilogMetadata
    testbenchData?: TestbenchData
    layout: Layout
    Input: any[]
    Output: any[]
    centerFocus: (embed: boolean) => void
    [key: string]: any
}

export interface ProjectData {
    name: string
    projectId?: string
    scopes: ScopeData[]
    timePeriod?: number
    clockEnabled?: boolean
    orderedTabs?: string[]
    focussedCircuit?: string | number
}

export interface SimulationArea {
    changeClockTime: (time: number) => void
    clockEnabled: boolean
    lastSelected: any
}
