export interface EmpresaItem {
    id: number;
    nombre: string;
    cuit: string;
    domicilio: string;
    telefono: string;
    email: string;
    rubro: string;
}

export interface EmpresaRequest {
    nombre: string;
    cuit: string;
    domicilio: string;
    telefono: string;
    email: string;
    rubro: string;
}

