import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button, EmptyState, PageHeader } from "../components/ui";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="page">
      <PageHeader title={title} description={description} />
      <div className="page__body">
        <EmptyState
          title="Módulo em implementação"
          description="A API já existe; esta tela será conectada na próxima etapa do frontend."
          action={
            <Link to="/dashboard">
              <Button variant="secondary" icon={ArrowLeft}>
                Voltar ao dashboard
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
