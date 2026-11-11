import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { api, ApiError } from "../api";
import { useAuth } from "../auth";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  InlineNotice,
  Modal,
  PageHeader,
  Skeleton,
  TextareaField,
  TextField,
} from "../components/ui";
import { formatBRL, formatDate, isManagementRole } from "../format";
import type { Product } from "../types";
import { useApiQuery } from "../useApiQuery";

type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  isActive: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  isActive: true,
};

function ProductFormModal({
  open,
  product,
  onClose,
  onSaved,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<ProductForm>(() =>
    product
      ? {
          name: product.name,
          description: product.description ?? "",
          price: String(product.price),
          category: product.category ?? "",
          isActive: product.isActive,
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price: Number.parseFloat(form.price),
        category: form.category || undefined,
        isActive: form.isActive,
      };
      if (product) {
        await api(`/products/${product.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={product ? "Editar produto" : "Novo produto"}
      description="Catálogo usado como base para os itens de negociação."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="product-form"
            loading={saving}
          >
            Salvar produto
          </Button>
        </>
      }
    >
      <form id="product-form" className="form-grid" onSubmit={submit}>
        {error ? (
          <div className="field--full">
            <InlineNotice>{error}</InlineNotice>
          </div>
        ) : null}
        <TextField
          label="Nome"
          name="name"
          className="field--full"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          required
        />
        <TextField
          label="Preço"
          name="price"
          type="number"
          min={0}
          step="0.01"
          value={form.price}
          onChange={(event) =>
            setForm((current) => ({ ...current, price: event.target.value }))
          }
          required
        />
        <TextField
          label="Categoria"
          name="category"
          value={form.category}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              category: event.target.value,
            }))
          }
        />
        <div className="field--full">
          <TextareaField
            label="Descrição"
            name="description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </div>
        <label className="checkbox field--full">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
          />
          Produto ativo no catálogo
        </label>
      </form>
    </Modal>
  );
}

export function ProductsPage() {
  const { user } = useAuth();
  const productsQuery = useApiQuery<Product[]>("/products");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [active, setActive] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const canWrite = Boolean(user && isManagementRole(user.role));
  const products = productsQuery.data ?? [];

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.category)
            .filter((item): item is string => Boolean(item)),
        ),
      ).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "ALL" || product.category === category;
      const matchesActive =
        active === "ALL" ||
        (active === "ACTIVE" ? product.isActive : !product.isActive);
      const matchesTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.category ?? "").toLowerCase().includes(term);
      return matchesCategory && matchesActive && matchesTerm;
    });
  }, [products, search, category, active]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setActionError("");
    try {
      await api(`/products/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      await productsQuery.reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Não foi possível remover.",
      );
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Produtos"
        description="Catálogo de planos e serviços usado nos itens de negociação."
        actions={
          canWrite ? (
            <Button variant="primary" icon={Plus} onClick={openCreate}>
              Novo produto
            </Button>
          ) : undefined
        }
      />

      {!canWrite ? (
        <InlineNotice>
          Seu papel permite consultar o catálogo, mas não alterá-lo.
        </InlineNotice>
      ) : null}

      {actionError ? <InlineNotice>{actionError}</InlineNotice> : null}

      <div className="toolbar">
        <div className="toolbar__group">
          <label className="toolbar__search">
            <Search size={14} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produto ou categoria"
              aria-label="Buscar produtos"
            />
          </label>
          <select
            className="toolbar__select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="ALL">Todas as categorias</option>
            {categories.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            className="toolbar__select"
            value={active}
            onChange={(event) =>
              setActive(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")
            }
            aria-label="Filtrar por status"
          >
            <option value="ALL">Ativos e inativos</option>
            <option value="ACTIVE">Somente ativos</option>
            <option value="INACTIVE">Somente inativos</option>
          </select>
        </div>
        <span className="toolbar__meta mono">
          {filtered.length} de {products.length}
        </span>
      </div>

      {productsQuery.loading ? (
        <div className="table-skeleton">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="sk-row" />
          ))}
        </div>
      ) : productsQuery.error ? (
        <ErrorState
          message={productsQuery.error}
          onRetry={() => {
            void productsQuery.reload();
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            products.length ? "Nenhum produto encontrado" : "Catálogo vazio"
          }
          description={
            products.length
              ? "Ajuste a busca ou os filtros."
              : "Cadastre o primeiro produto para usar nos negócios."
          }
          action={
            canWrite && !products.length ? (
              <Button variant="primary" icon={Plus} onClick={openCreate}>
                Novo produto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th className="is-right">Preço</th>
                <th>Status</th>
                <th>Atualizado</th>
                {canWrite ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td className="is-strong">
                    {product.name}
                    {product.description ? (
                      <span className="table-sub">{product.description}</span>
                    ) : null}
                  </td>
                  <td>{product.category ?? "—"}</td>
                  <td className="is-right mono">{formatBRL(product.price)}</td>
                  <td>
                    <Badge tone={product.isActive ? "success" : "neutral"}>
                      {product.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="mono">{formatDate(product.updatedAt)}</td>
                  {canWrite ? (
                    <td>
                      <div className="table-actions">
                        <IconButton
                          label="Editar"
                          icon={Pencil}
                          size="sm"
                          onClick={() => openEdit(product)}
                        />
                        <IconButton
                          label="Remover"
                          icon={Trash2}
                          size="sm"
                          onClick={() => setDeleting(product)}
                        />
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal
        key={`${editing?.id ?? "new"}-${modalOpen}`}
        open={modalOpen}
        product={editing}
        onClose={() => setModalOpen(false)}
        onSaved={productsQuery.reload}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remover produto"
        message={`Remover ${deleting?.name ?? "este produto"}? Produtos usados em negócios precisam ser desativados em vez de removidos.`}
        confirmLabel="Remover"
        loading={deleteLoading}
        onConfirm={() => {
          void confirmDelete();
        }}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
