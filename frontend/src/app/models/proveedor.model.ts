export interface Proveedor {
    id: number;
    razonSocial: string;
    cuit: string;
    rubro: string;
    telefono: string;
    email: string;
    estado: string;
}

export interface ProveedorRequest {
    razonSocial: string;
    cuit: string;
    rubro: string;
    telefono: string;
    email: string;
    estado: string;
}

export interface ProveedorItem {
    id: number;
    razonSocial: string;
    cuit: string;
    rubro: string;
    telefono: string;
    email: string;
    estado: 'Activo' | 'Inactivo';
}