import React, { useEffect, useState } from "react";
import "./contract-templates.scss";
import useLocalStorageState from "use-local-storage-state";
import {
  CONTRACT_TEMPLATE_KEY,
  ContractTemplate,
  NetworkCluster,
} from "@utils/constants";
import Header from "@components/header";
import ContractTemplateCard from "@components/contract-template-card";
import { capitalize } from "@utils/utils";
import { Drawer } from "antd";
import useNotification from "antd/es/notification/useNotification";
import ContractTemplateForm, {
  ContractTemplateFormStructure,
  parseContractTemplateForm,
} from "@components/contract-template-form";
import Paragraph from "antd/es/typography/Paragraph";
import { XBlock, XMasonry } from "react-xmasonry";
import ConfirmModal from "@components/confirm-modal";

const ContractTemplates: React.FC = () => {
  const [notification, contextHolder] = useNotification();
  const [contractTemplates, setContractTemplates] = useLocalStorageState<
    ContractTemplate[]
  >(CONTRACT_TEMPLATE_KEY, { defaultValue: [] });
  const [displayedTemplates, setDisplayedTemplates] = useState<
    ContractTemplate[]
  >([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [searchedName, setSearchedName] = useState<string>();
  const [templateForm, setTemplateForm] = useState<{
    open: boolean;
    form?: ContractTemplateFormStructure;
  }>({ open: false, form: undefined });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string>();

  useEffect(() => {
    setDisplayedTemplates(
      contractTemplates.filter((template) => {
        if (
          searchedName &&
          !template.name.toLowerCase().includes(searchedName.toLowerCase())
        )
          return false;
        for (const selectedNetworkCluster of selectedClusters)
          if (
            !template.networkClusters
              .map((cluster) => cluster.toString())
              .includes(selectedNetworkCluster)
          )
            return false;
        return true;
      })
    );
  }, [contractTemplates, selectedClusters, searchedName]);

  const parseToContractTemplate = (
    form: ContractTemplateFormStructure
  ): ContractTemplate => {
    try {
      return parseContractTemplateForm(form, templateForm.form?.id);
    } catch (e) {
      notification.error({
        message: "Invalid data",
        description: (
          <Paragraph
            ellipsis={{ rows: 4, expandable: true, symbol: "View Full" }}
          >
            {e instanceof Error ? e.message : String(e)}
          </Paragraph>
        ),
      });
      throw e;
    }
  };

  const saveContractTemplate = (template: ContractTemplate) => {
    setContractTemplates(
      contractTemplates.some((t) => t.id === template.id)
        ? contractTemplates.map((t) => (t.id === template.id ? template : t))
        : [...contractTemplates, template]
    );
    setTemplateForm({ open: false });
    notification.success({
      message: "Contract Saved",
      description: "A contract template has been saved",
    });
  };

  const deleteContractTemplate = (id?: string) => {
    setContractTemplates(
      contractTemplates.filter((template) => template.id !== id)
    );
  };

  const editContractTemplate = (id: string) => {
    const template = contractTemplates.find((template) => template.id === id);
    if (!template) notification.error({ message: "Template not found" });
    else
      setTemplateForm({
        open: true,
        form: {
          id: template.id,
          name: template.name,
          abi: JSON.stringify(template.abi),
          desscription: template.description,
          bytecode: template.bytecode,
          flattenSource: template.flattenSource,
          programKeypair: template.programKeypair
            ? JSON.stringify(template.programKeypair)
            : undefined,
          networkClusters: template.networkClusters.map((cluster) =>
            cluster.toString()
          ),
        },
      });
  };

  return (
    <div className="page">
      {contextHolder}
      <Header
        header="Contract Templates"
        options={Object.values(NetworkCluster).map((cluster) => ({
          value: cluster.toString(),
          label: capitalize(cluster.toString()),
        }))}
        onSelected={setSelectedClusters}
        onSearched={setSearchedName}
        onAddRequested={() => setTemplateForm({ open: true, form: undefined })}
        defaultSelectAll={false}
      />
      <div className="masonry-container">
        <XMasonry center={false} targetBlockWidth={360}>
          {displayedTemplates.map((template) => (
            <XBlock key={template.id}>
              <ContractTemplateCard
                contractTemplate={template}
                onDeleteTemplate={setConfirmDeleteId}
                onEditTemplate={editContractTemplate}
              />
            </XBlock>
          ))}
        </XMasonry>
      </div>
      <Drawer
        width={700}
        title={
          templateForm.form ? templateForm.form.name : "Add Contract Template"
        }
        open={templateForm.open}
        closable={true}
        onClose={() => setTemplateForm({ ...templateForm, open: false })}
      >
        <ContractTemplateForm
          templateForm={templateForm}
          saveContractTemplate={(template) =>
            saveContractTemplate(parseToContractTemplate(template))
          }
        />
      </Drawer>
      <ConfirmModal
        showModal={confirmDeleteId !== undefined}
        danger
        onOk={() => deleteContractTemplate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(undefined)}
        title="Delete this template?"
        description="This action can not be undone. All information associated with this template will be lost."
        okText="Delete Template"
      />
    </div>
  );
};

export default ContractTemplates;
